import { connection, Document, Model, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";

export interface IEotDocument extends Document {
    order: number;
    effect: string;
}

// tslint:disable-next-line: no-empty-interface
export interface IEot extends IEotDocument {

}

export interface IEotModel extends Model<IEot> {
    getSurrounding(num: number): IEot[];
}

const EotSchema = new Schema({
    order: { type: Number, required: true },
    effect: { type: String, required: true }
}, { collection: "eotEffects" });

EotSchema.plugin(autoIncrement, {
    model: "EOT",
    startAt: 1
});

EotSchema.statics.getSurrounding = async function(num: number) {
    const effects = await this.find({
        order: {
            $gt: Math.floor(num) - 3,
            $lt: Math.floor(num) + 3
        }
    }).sort("order");

    return effects;
};

const db = connection.useDb("monbrey-urpg-v2");
export const Eot: IEotModel = db.model<IEot, IEotModel>("EOT", EotSchema);
