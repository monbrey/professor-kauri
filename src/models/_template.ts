import { Document, model, Model, Schema } from 'mongoose';

export interface IThingDocument extends Document {
  // Properties
}

export interface IThing extends IThingDocument {
  // Instance methods
}

export interface IThingModel extends Model<IThing> {
  // Static methods
}

const ModelSchema = new Schema({});

export const Thing: IThingModel = model<IThing, IThingModel>('Model', ModelSchema);
