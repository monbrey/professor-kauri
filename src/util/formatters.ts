import type { Species } from "urpg.js";

// General
export const titleCase = (str: string) => str[0].toUpperCase() + str.slice(1).toLowerCase();

// Dex
export const abilities = ({ abilities }: Species) => `-${abilities.map((ability) => `${ability.name}${ability.hidden ? " (HA)" : ""}`).join("\n- ")}`;

export const genders = ({ maleAllowed, femaleAllowed }: Species) => {
	if (maleAllowed && femaleAllowed) {
		return "Male ♂️ | Female ♀️";
	}

	if (maleAllowed) {
		return "Male ♂️";
	}

	if (femaleAllowed) {
		return "Female ♀️";
	}

	return "Genderless";
};

export const prices = ({ pokemart, contestCredits }: Species) => {
	const prices = [];

	if (pokemart !== -1) {
		prices.push(`- Pokémart: ${pokemart.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}`);
	}

	if (contestCredits !== -1) {
		prices.push(`- Berry Store: ${pokemart.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}`);
	}

	return prices.length ? "- Not available for purchase" : prices.join("\n");
};
