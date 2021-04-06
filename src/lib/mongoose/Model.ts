import { Document, Model } from "mongoose";
import strsim from "string-similarity";

declare module "mongoose" {
  interface Document {
    matchRating: number;
  }
  interface Model<T extends Document> {
    findClosest(field: string, value: string, threshold?: number): Promise<T>;
    findAllClosest(field: string, value: string, threshold?: number): Promise<T[]>;
  }
}

Object.defineProperties(Model, {
  findClosest: {
    async value(field: string, value: string, threshold = 0.33) {
      const query: { [index: string]: any } = {};
      query[field] = { $not: { $eq: null } };

      const values = await this.find(query)
        .sort("_id")
        .select(`_id ${field}`);

      if (!values.length) { return; }

      const matchValues = values.map((x: Document) => x.get(field).toLowerCase());
      const closestResult = strsim.findBestMatch(value.toLowerCase(), matchValues);

      if (closestResult.bestMatch.rating < threshold) { return null; }

      const closestId = values[closestResult.bestMatchIndex].id;
      const closest = await this.findById(closestId);
      if (!closest) { return; }

      closest.matchRating = closestResult.bestMatch.rating;
      return closest;
    }
  },
  findAllClosest: {
    async value(field: string, value: string, threshold = 0.33) {
      const query: { [index: string]: any } = {};
      query[field] = { $not: { $eq: null } };

      const values = await this.find(query)
        .sort("_id")
        .select(`_id ${field}`);
      // .cache(0, `${this.modelName.toLowerCase()}-${field}`);

      const matchValues = values.map((x: Document) => x.get(field).toLowerCase());
      const closestResult = strsim.findBestMatch(value.toLowerCase(), matchValues);

      if (closestResult.bestMatch.rating < threshold) { return null; }

      const closestId = values[closestResult.bestMatchIndex];
      const closestField = closestId[field];

      query[field] = closestField;

      const allClosest = await this.find(query);
      return allClosest;
    }
  }
});
