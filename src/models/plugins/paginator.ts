// import { Model, Schema } from "mongoose";

// /**
//  * @param {Object}              [query={}]
//  * @param {Object}              [options={}]
//  * @param {Object|String}         [options.select]
//  * @param {Object|String}         [options.sort]
//  * @param {Array|Object|String}   [options.populate]
//  * @param {Number}                [options.page=1]
//  * @param {Number}                [options.limit=10]
//  * @param {Function}            [callback]
//  *
//  * @returns {Promise<Object>}
//  */
// const paginate: any = async function(this: Model<any>, query: any = {}, options: any = {}, sortFunc: any, page: number = 1, limit: number = 12) {
//     const docs = await this.find(query, null, options).lean();
//     docs.cache(60, "pagination");
//     const count = docs.length;
//     const next = page * limit < docs.length ? page + 1 : false;
//     const prev = page > 1 ? page - 1 : false;
//     const pages = Math.ceil(count / limit);

//     if (sortFunc) { docs.sort(sortFunc); }

//     return {
//         docs: docs.slice((page - 1) * limit, page * limit),
//         count,
//         page,
//         next,
//         prev,
//         pages
//     } as { [index: string]: any };
// };

// export default function(schema: Schema) {
//     schema.statics.paginate = paginate;
// }

// export { paginate as paginate };
