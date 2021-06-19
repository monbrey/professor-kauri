// Load environment variables from file
import { Intents } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

// Custom Client
import { KauriClient } from './lib/KauriClient';
// Akairo Extensions
import './lib/misc/Number';
import './lib/misc/String';
// Mongoose Extensions
import './lib/mongoose/Model';
// Discord Extensions
import './lib/structures/GuildTrainer';
import './lib/structures/KauriChannel';
import './lib/structures/KauriGuild';
import './lib/structures/KauriMessage';
// Utility
import './util/db';

const client = new KauriClient({
  allowedMentions: { parse: ['users', 'roles'] },
  partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER'],
  intents: [new Intents(Intents.NON_PRIVILEGED).add(Intents.FLAGS.GUILD_MEMBERS).toArray()],
  restTimeOffset: 100,
});

client.start();
