import { Client } from "urpg.js";

const _urpg = new Client({ environment: "production" });

export const urpg = _urpg;
