import { Snowflake } from 'discord.js';
import { Document, Schema } from 'mongoose';

export interface ICommandConfigDocument extends Document {
  command: string;
  disabled: boolean;
  channels: Array<{
    channel_id: Snowflake;
    disabled: boolean;
  }>;
  roles: Array<{
    role_id: Snowflake;
    disabled: boolean;
  }>;
}

export const CommandConfig = new Schema(
  {
    command: { type: String, required: true },
    disabled: { type: Boolean, required: true },
    channels: [
      {
        channel_id: { type: String, required: true },
        disabled: { type: Boolean, required: true },
      },
      { _id: false },
    ],
    roles: [
      {
        role_id: { type: String, required: true },
        disabled: { type: Boolean, required: true },
      },
      { _id: false },
    ],
  },
  { _id: false },
);
