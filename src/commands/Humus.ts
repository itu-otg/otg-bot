import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { send } from '@sapphire/plugin-editable-commands';

@ApplyOptions<Command.Options>({
	description: 'humus komut'
})
export class UserCommand extends Command {
	public override async messageRun(message: Message) {
		return send(message, "hello");
	}
}
