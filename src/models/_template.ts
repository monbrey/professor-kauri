import { Document, model, Model, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";

export interface IThingDocument extends Document {
    // properties
}

export interface IThing extends IThingDocument {
    // instance methods
}

export interface IThingModel extends Model<IThing> {
    // static methods
}

const ModelSchema = new Schema({

});

export const Thing: IThingModel =  model<IThing, IThingModel>("Model", ModelSchema);
