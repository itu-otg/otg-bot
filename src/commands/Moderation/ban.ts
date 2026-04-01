import { Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionsBitField } from 'discord.js';

export class BanCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'ban',
			description: 'Bans a user from the server and logs it in the database.',
			requiredClientPermissions: ['BanMembers'],
			requiredUserPermissions: ['BanMembers']
		});
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
				.addUserOption((option) =>
					option
						.setName('target')
						.setDescription('The user to ban')
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName('reason')
						.setDescription('The reason for the ban')
						.setRequired(true)
				)
				.addIntegerOption((option) =>
					option
						.setName('delete_messages')
						.setDescription('Delete messages from the user (in seconds)')
						.setRequired(false)
						.addChoices(
							{ name: 'Don\'t delete any', value: 0 },
							{ name: 'Previous Hour', value: 3600 },
							{ name: 'Previous 24 Hours', value: 86400 },
							{ name: 'Previous 7 Days', value: 604800 }
						)
				)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const targetUser = interaction.options.getUser('target', true);
		const reason = interaction.options.getString('reason', true);
		const deleteMessageSeconds = interaction.options.getInteger('delete_messages') ?? 0;
		const guildId = interaction.guildId;
		const moderatorId = interaction.user.id;

		if (!guildId || !interaction.guild) {
			return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
		}

		if (targetUser.id === moderatorId) {
			return interaction.reply({ content: 'You cannot ban yourself.', ephemeral: true });
		}

		if (targetUser.id === interaction.client.id) {
			return interaction.reply({ content: 'I cannot ban myself.', ephemeral: true });
		}

		await interaction.deferReply();

		const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

		if (targetMember) {
			if (!targetMember.bannable) {
				return interaction.editReply({
					content: 'I cannot ban this user. They may have a higher role than me or are the server owner.'
				});
			}

			// Check if the moderator has a higher role than the target
			const modMember = await interaction.guild.members.fetch(moderatorId);
			if (modMember.roles.highest.position <= targetMember.roles.highest.position) {
				return interaction.editReply({
					content: 'You cannot ban a user with a role equal to or higher than yours.'
				});
			}
		}

		//use a try catch here to not stall the code if there is a issue with the dm since it isnt important 
		try {
			await targetUser.send(`You have been banned from **${interaction.guild.name}**. Reason: ${reason}`);
		} catch (err) {
		}

		await interaction.guild.members.ban(targetUser, {
			reason: `${reason} - Banned by ${interaction.user.tag}`,
			deleteMessageSeconds: deleteMessageSeconds
		});

		const banRecord = await this.container.db.ban.create({
			data: {
				userId: targetUser.id,
				guildId: guildId,
				moderatorId: moderatorId,
				reason: reason,
			},
		});

		const embed = new EmbedBuilder()
			.setColor('Red')
			.setTitle('User Banned')
			.setThumbnail(targetUser.displayAvatarURL())
			.addFields(
				{ name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
				{ name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
				{ name: 'Reason', value: reason },
				{ name: 'Ban Record ID', value: `#${banRecord.id}`, inline: true }
			)
			.setTimestamp();

		return interaction.editReply({ embeds: [embed] });
	}
}
