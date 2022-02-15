import { Schema } from 'mongoose';

type ReviewType = {
    user: Schema.Types.ObjectId;
    book: Schema.Types.ObjectId;
    score: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
};

export default ReviewType;
