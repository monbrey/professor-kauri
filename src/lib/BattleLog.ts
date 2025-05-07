import type { APIContainerComponent, APISeparatorComponent, APITextDisplayComponent, APIUser } from "@discordjs/core";
import { ComponentType } from "@discordjs/core";
import { stripIndents } from "common-tags";
import { sep } from "path";

export class BattleLog {
	public readonly id: number;
	public winner?: APIUser;
	public winningTeam?: string;
	public loser?: APIUser;
	public losingTeam?: string;
	public description?: string;
	public size?: number;
	public generation?: string;
	public privacy?: string;
	public format?: string;
	public clauses?: string[];
	public createdAt: Date;

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

	private generateRulesBlock(): APITextDisplayComponent | undefined {
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

		if (rules.length > 0)
			return {
				type: ComponentType.TextDisplay,
				content: rules.join("\n"),
			};
	}

	private generateTeamBlock(): APITextDisplayComponent | undefined {
		if (!this.winner || !this.loser) return;
		if (!this.winningTeam || !this.losingTeam) return;

		return {
			type: ComponentType.TextDisplay,
			content: stripIndents`
				${this.winner?.username}'s ${this.winningTeam}
				vs
				${this.loser?.username}'s ${this.losingTeam}
			`
		}
	}

	private generateCashBlock(): APITextDisplayComponent | undefined {
		if (this.winner && this.loser) {
			return {
				type: ComponentType.TextDisplay,
				content: stripIndents`
					${this.winner.username}: $${this.size ? this.size * 500 : ''}
					${this.loser.username}: $${this.size ? this.size * 250 : ''}
				`
			}
		}
	}

	public generateLogContainer(draft = true) {
		const separator: APISeparatorComponent = { type: ComponentType.Separator };
		const container: APIContainerComponent = {
			type: ComponentType.Container,
			components: [
				this.generateTitleComponent(),
				separator,
			]
		};

		const rules = this.generateRulesBlock();
		const teams = this.generateTeamBlock();
		const cash = this.generateCashBlock();

		if (rules) {
			container.components.push(rules, separator);
		}

		if (teams) {
			container.components.push(teams, separator);
		}

		if (this.description) {
			container.components.push({ type: ComponentType.TextDisplay, content: this.description, }, separator);
		};

		if (cash) {
			container.components.push(cash, separator);
		}

		container.components.push({ type: ComponentType.TextDisplay, content: `-# ${this.createdAt.toUTCString()}` });

		return container;
	}
}
