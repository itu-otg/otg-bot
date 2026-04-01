import { Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionsBitField } from 'discord.js';

export class KickCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'kick',
			description: 'Kicks a user from the server and logs it in the database.',
			requiredClientPermissions: ['KickMembers'],
			requiredUserPermissions: ['KickMembers']
		});
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
				.addUserOption((option) =>
					option
						.setName('target')
						.setDescription('The user to kick')
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName('reason')
						.setDescription('The reason for the kick')
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const targetUser = interaction.options.getUser('target', true);
		const reason = interaction.options.getString('reason', true);
		const guildId = interaction.guildId;
		const moderatorId = interaction.user.id;

		if (!guildId || !interaction.guild) {
			return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
		}

		if (targetUser.id === moderatorId) {
			return interaction.reply({ content: 'You cannot kick yourself.', ephemeral: true });
		}

		if (targetUser.id === interaction.client.id) {
			return interaction.reply({ content: 'I cannot kick myself.', ephemeral: true });
		}


		await interaction.deferReply();


		const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

		if (!targetMember) {
			return interaction.editReply({
				content: 'That user is not currently in the server, so they cannot be kicked.'
			});
		}


		if (!targetMember.kickable) {
			return interaction.editReply({
				content: 'I cannot kick this user. They may have a higher role than me or are the server owner.'
			});
		}


		const modMember = await interaction.guild.members.fetch(moderatorId);
		if (modMember.roles.highest.position <= targetMember.roles.highest.position) {
			return interaction.editReply({
				content: 'You cannot kick a user with a role equal to or higher than yours.'
			});
		}

		try {
			await targetUser.send(`You have been kicked from **${interaction.guild.name}**. Reason: ${reason}`);
		} catch (err) {

		}
		//ignore if there is any errors in dms.


		await targetMember.kick(`${reason} - Kicked by ${interaction.user.tag}`);


		const kickRecord = await this.container.db.kick.create({
			data: {
				userId: targetUser.id,
				guildId: guildId,
				moderatorId: moderatorId,
				reason: reason,
			},
		});


		const embed = new EmbedBuilder()
			.setColor('Yellow')
			.setTitle('User Kicked')
			.setThumbnail(targetUser.displayAvatarURL())
			.addFields(
				{ name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
				{ name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
				{ name: 'Reason', value: reason },
				{ name: 'Kick Record ID', value: `#${kickRecord.id}`, inline: true }
			)
			.setTimestamp();

		return interaction.editReply({ embeds: [embed] });
	}
}
