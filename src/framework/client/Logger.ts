import { captureEvent, captureException, captureMessage, init, Integrations as SentryIntegrations, Severity } from '@sentry/node';
import { Integrations as TracingIntegrations } from '@sentry/tracing';
import { CommandInteraction } from 'discord.js';
import { container } from 'tsyringe';

if (!process.env.SENTRY_URL) {
	throw new Error('Environment variable "SENTRY_URL" not defined');
}

init({
	dsn: process.env.SENTRY_URL,
	integrations: [
		new SentryIntegrations.Modules(),
		new SentryIntegrations.FunctionToString(),
		new SentryIntegrations.LinkedErrors(),
		new SentryIntegrations.Console(),
		new TracingIntegrations.Postgres()
	]
});

export class Logger {
	public logCommand(interaction: CommandInteraction) {
		captureMessage(`Command executed`,
			context => {
				context.setExtras({
					timestamp: interaction.createdTimestamp / 1000,
					data: interaction.options.data
				});
				context.setLevel(Severity.Debug);
				context.setTransactionName(interaction.commandName);
				context.setUser(interaction.user);
				return context;
			});
	}

	public logEvent(name: string) {
		captureMessage(`Event fired`,
			context => {
				context.setExtras({
					transaction: name,
					timestamp: Date.now() / 1000

				});
				context.setLevel(Severity.Debug);
				context.setTransactionName(name);
				return context;
			});
	}

	public captureMessage = captureMessage;
	public captureEvent = captureEvent;
	public captureException = captureException;
}
container.register<Logger>('Logger', {
	useValue: new Logger()
});
