import { Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionsBitField } from 'discord.js';

export class WarnCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'warn',
			description: 'Warns a user and records it in the database.',
			requiredClientPermissions: ['SendMessages'],
			requiredUserPermissions: ['ModerateMembers']
		});
	}


	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
				.addUserOption((option) =>
					option
						.setName('target')
						.setDescription('The user to warn')
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName('reason')
						.setDescription('The reason for the warning')
						.setRequired(true)
				)
		);
	}


	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const targetUser = interaction.options.getUser('target', true);
		const reason = interaction.options.getString('reason', true);
		const guildId = interaction.guildId;
		const moderatorId = interaction.user.id;

		if (!guildId) {
			return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
		}

		if (targetUser.bot) {
			return interaction.reply({ content: 'You cannot warn bots.', ephemeral: true });
		}

		if (targetUser.id === moderatorId) {
			return interaction.reply({ content: 'You cannot warn yourself.', ephemeral: true });
		}


		await interaction.deferReply();

		const warningRecord = await this.container.db.warning.create({
			data: {
				userId: targetUser.id,
				guildId: guildId,
				moderatorId: moderatorId,
				reason: reason,
			},
		});


		const totalWarnings = await this.container.db.warning.count({
			where: {
				userId: targetUser.id,
				guildId: guildId,
			},
		});


		const embed = new EmbedBuilder()
			.setColor('Orange')
			.setTitle('User Warned')
			.addFields(
				{ name: 'User', value: `${targetUser} (${targetUser.id})`, inline: true },
				{ name: 'Moderator', value: `${interaction.user} (${moderatorId})`, inline: true },
				{ name: 'Reason', value: reason },
				{ name: 'Warning ID', value: `#${warningRecord.id}`, inline: true },
				{ name: 'Total Warnings', value: `${totalWarnings}`, inline: true }
			)
			.setTimestamp();


		try {
			await targetUser.send(`You have been warned in **${interaction.guild?.name}** for: ${reason}`);
		} catch (err) {

			embed.setFooter({ text: 'Note: Could not DM the user about this warning.' });
		}


		return interaction.editReply({ embeds: [embed] });

	}
}
