import { CustomHelpers } from 'joi';
import { isValidObjectId } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isObjectId = (value: any, helpers: CustomHelpers) => {
    if (isValidObjectId(value)) {
        return value;
    } else {
        return helpers.error('any.invalid');
    }
};

export default isObjectId;
