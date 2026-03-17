import { ApplyOptions } from '@sapphire/decorators';
import { Command, UserError } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { send } from '@sapphire/plugin-editable-commands';

@ApplyOptions<Command.Options>({
	description: 'humus komut'
})
export class UserCommand extends Command {
	public override async messageRun(message: Message) {
		if (0 == 0) {
			throw new UserError({
				identifier: 'DatabaseError',
				message: 'CRITICAL: Database connection lost while fetching user profile!'
			});
		}
		return send(message, "news and stuff");
	}
}
