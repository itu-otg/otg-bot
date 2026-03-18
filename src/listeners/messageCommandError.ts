import { ApplyOptions } from '@sapphire/decorators';
import { Listener, Events, UserError } from '@sapphire/framework';
import type { MessageCommandErrorPayload } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';

@ApplyOptions<Listener.Options>({
	event: Events.MessageCommandError
})
export class UserEvent extends Listener<typeof Events.MessageCommandError> {
	public override async run(error: unknown, payload: MessageCommandErrorPayload) {
		const { message, command } = payload;

		if (error instanceof UserError) {
			return send(message, `**Error**: ${error.message}`);
		}

		this.container.logger.error(`[Command Error] ${command.name}:`, error);
		return send(message, 'An unexpected internal error occurred. Please try again later.');
	}
}
