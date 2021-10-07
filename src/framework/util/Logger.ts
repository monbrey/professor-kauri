import log4js from "log4js";
import type { Configuration } from "log4js";

const config: Configuration = {
	appenders: {
		out: {
			type: "stdout",
			layout: {
				type: "pattern",
				pattern: "timestamp=%d level=%p %x{data}",
				tokens: {
					data: function (logEvent) {
						return logEvent.data.flatMap(data => {
							if (typeof data === "string") {
								return `message=${data}`;
							} else {
								return Object.entries(data).map(([k, v]) => `${k}=${v}`);
							}
						}).join(" ");
					},
				},
			},
		},
	},
	categories: {
		default: { appenders: ["out"], level: "debug" },
	},
};

log4js.configure(config);
const _logger = log4js.getLogger();
export const Logger = _logger;
