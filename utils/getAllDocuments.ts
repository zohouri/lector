import _pick from 'lodash.pick';
import _difference from 'lodash.difference';
import _pull from 'lodash.pull';
import _cloneDeep from 'lodash.clonedeep';
import AppError from './error/AppError';
import { Model } from 'mongoose';
import { request } from 'express';

export default class GetAllDocuments {
    criteria!: Record<string, unknown>;
    queryString!: typeof request.query;
    mongooseModel!: Model<any>;
    query!: ReturnType<Model<any>['find']>;
    indexes: Record<string, string | number>[] = [];

    static async getInstance(
        mongooseModel: Model<any>,
        queryString: typeof request.query,
        criteria = {}
    ) {
        const instance = new GetAllDocuments();

        instance.criteria = criteria;
        instance.queryString = queryString;
        instance.mongooseModel = mongooseModel;
        instance.query = mongooseModel.find();

        await instance.getIndexes();
        return instance;
    }

    run() {
        return this.filter().sort().paginate().query.find(this.criteria);
    }

    async countDocuments() {
        const count = await this.mongooseModel
            .find(this.filterUserQuery())
            .find(this.criteria)
            .countDocuments();
        return count;
    }

    filter() {
        this.query = this.query.find(this.filterUserQuery());

        return this;
    }

    sort() {
        const requestedSort = this.queryString.sort;
        if (typeof requestedSort === 'string') {
            const sortBy = requestedSort.split(',');
            this.checkIndexesForSort(sortBy);
            this.query = this.query.sort(sortBy.join(' '));
        } else {
            this.query = this.query.sort('-_id');
        }

        return this;
    }

    paginate() {
        const requestedPage = this.queryString.page;
        const requestedLimit = this.queryString.limit;

        const page =
            typeof requestedPage === 'string' ? parseInt(requestedPage) || 1 : 1;
        let limit =
            typeof requestedLimit === 'string' ? parseInt(requestedLimit) || 100 : 100;

        if (limit > 100) limit = 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }

    filterUserQuery() {
        const queryObj = _cloneDeep(this.queryString);

        const excludedFields = ['page', 'limit', 'sort'];
        excludedFields.forEach(el => delete queryObj[el]);

        this.checkIndexesForQuery(queryObj);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        return JSON.parse(queryStr);
    }

    async getIndexes() {
        const definedIndexes: { key: Record<string, number | string>; name: string }[] =
            await this.mongooseModel.listIndexes();
        const indexes = definedIndexes.map(index => index.key);

        const newIndexes: Record<string, number | string>[] = [];
        indexes.forEach(inx => {
            const keys = Object.keys(inx);
            while (keys.length > 1) {
                keys.pop();
                newIndexes.push(_pick(inx, keys));
            }
        });

        indexes.push(...newIndexes);
        this.indexes = indexes;
    }

    checkIndexesForQuery(queryObj: typeof request.query) {
        const simpleIndexes: string[] = [];
        const compoundIndexes: string[][] = [];

        this.indexes.forEach(inx => {
            const inxKeys = Object.keys(inx);
            if (inxKeys.length === 1) {
                simpleIndexes.push(inxKeys[0]);
            } else {
                compoundIndexes.push(inxKeys);
            }
        });

        const requestedFields = Object.keys(queryObj);
        const rejectedFields = _difference(requestedFields, simpleIndexes);

        [...rejectedFields].forEach(field => {
            const found = compoundIndexes.find(
                inxArr => inxArr[inxArr.length - 1] === field
            );

            if (found && _difference(found, requestedFields).length === 0) {
                _pull(rejectedFields, field);
            }
        });

        if (rejectedFields.length) {
            throw new AppError(400, 'Query is not applicable!');
        }
    }

    checkIndexesForSort(sortBy: string[]) {
        const sortObjOriginal: Record<string, number> = {};
        const sortObjReverse: Record<string, number> = {};
        sortBy.forEach(el => {
            const keyName = el.charAt(0) === '-' ? el.substring(1) : el;
            sortObjOriginal[keyName] = el.charAt(0) === '-' ? -1 : 1;
            sortObjReverse[keyName] = el.charAt(0) === '-' ? 1 : -1;
        });

        if (
            !this.indexes.some(
                index =>
                    JSON.stringify(index) === JSON.stringify(sortObjOriginal) ||
                    JSON.stringify(index) === JSON.stringify(sortObjReverse)
            )
        ) {
            throw new AppError(400, 'Sort is not applicable!');
        }
    }
}
