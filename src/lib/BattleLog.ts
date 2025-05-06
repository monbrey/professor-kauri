import type { APIContainerComponent, APITextDisplayComponent, APIUser } from "@discordjs/core";
import { ComponentType } from "@discordjs/core";
import { stripIndents } from "common-tags";

export class BattleLog {
	public readonly id: number;
	public winner?: APIUser;
	public winningTeam?: string;
	public loser?: APIUser;
	public losingTeam?: string;
	public description?: string;
	public size?: string;
	public generation?: string;
	public privacy?: string;
	public format?: string;
	public clauses?: string[];
	public createdAt?: Date;

	public constructor(id: number) {
		this.id = id;
		this.createdAt = new Date();
	}

	private generateTitleComponent(): APITextDisplayComponent {
		return {
			type: ComponentType.TextDisplay,
			content: `### Battle Log #${this.id}`,
		};
	}

	private generateRulesBlock(): APITextDisplayComponent {
		const rules = [];
		if (this.winner && this.loser) {
			rules.push(`**<@${this.winner.id}> vs <@${this.loser.id}>**`);
		}

		if (this.size) {
			rules.push(`${this.size}v${this.size}`);
		}

		if (this.generation) {
			rules.push(this.generation);
		}

		if (this.privacy) {
			rules.push(this.privacy);
		}

		if (this.format) {
			rules.push(this.format);
		}

		if (this.clauses && this.clauses.length > 0) {
			rules.push(this.clauses.join(", "));
		}

		return {
			type: ComponentType.TextDisplay,
			content: rules.join("\n"),
		};
	}

	private formatTeamBlock() {
		return this.winner && this.loser && this.winningTeam && this.losingTeam ?
			stripIndents`
				${this.winner?.username} 's ${this.winningTeam}
		vs
				${this.loser?.username} 's ${this.losingTeam}
			` : "";
	}

	private formatCashBlock() {
		return stripIndents`
			${this.winner?.username ?? "*Pending*"}: $${Number(this.size) * 500}
			${this.loser?.username ?? "*Pending*"}: $${Number(this.size) * 250}
		`;
	}

	public generateLogContainer(draft = true) {
		const container: APIContainerComponent = {
			type: ComponentType.Container,
			components: [
				this.generateTitleComponent(),
				{ type: ComponentType.Separator },
				this.generateRulesBlock() ?? null,
				{ type: ComponentType.Separator },
			],
		};

		const teams = this.formatTeamBlock();
		if (teams.trim().length > 0) {
			container.components.push({
				type: ComponentType.TextDisplay,
				content: teams,
			}, {
				type: ComponentType.Separator,
				divider: true,
			});
		}

		if (this.description) {
			container.components.push({
				type: ComponentType.TextDisplay,
				content: this.description,
			}, {
				type: ComponentType.Separator,
				divider: true,
			});
		}

		const cash = this.formatCashBlock();
		if (cash.trim().length > 0) {
			container.components.push({
				type: ComponentType.TextDisplay,
				content: cash,
			});
		}

		return container;
	}
}
