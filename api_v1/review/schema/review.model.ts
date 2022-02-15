import { model, Schema } from 'mongoose';
import BookModel from '../../book/schema/book.model';
import UserModel from '../../user/schema/user.model';
import ReviewType from './review.type';

const reviewSchema = new Schema<ReviewType>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User id is required!'],
            validate: {
                validator: async (value: string) => {
                    const count = await UserModel.findById(value).countDocuments();
                    return count === 1;
                },
                message: 'User id is not valid!'
            }
        },
        book: {
            type: Schema.Types.ObjectId,
            ref: 'Book',
            required: [true, 'Book id is required!'],
            validate: {
                validator: async (value: string) => {
                    const count = await BookModel.findById(value).countDocuments();
                    return count === 1;
                },
                message: 'Book id is not valid!'
            }
        },
        score: {
            type: Number,
            required: [true, 'Score is required!'],
            validate: [Number.isInteger, 'Score must be an integer number!'],
            min: [1, 'Score can not be less than 1!'],
            max: [5, 'Score can not be greater than 5!']
        },
        content: {
            type: String,
            trim: true,
            maxlength: [250, 'Content is too long!']
        }
    },
    {
        timestamps: true,
        toJSON: { versionKey: false },
        toObject: { versionKey: false }
    }
);

// Indexes
reviewSchema.index({ user: 1 });
reviewSchema.index({ book: 1 });
reviewSchema.index({ score: 1 });

const ReviewModel = model<ReviewType>('Review', reviewSchema);

export default ReviewModel;
