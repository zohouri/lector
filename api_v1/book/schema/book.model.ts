import { Model, model, Schema, Types } from 'mongoose';
import AuthorModel from '../../author/schema/author.model';
import ReviewModel from '../../review/schema/review.model';
import { BookType } from './book.type';
import Languages from './languages.enum';

type BookStatics = Model<BookType> & {
    calculateScore(bookId: string): Promise<void>;
};

const bookSchema = new Schema<BookType, BookStatics>(
    {
        title: {
            type: String,
            trim: true,
            required: [true, 'Book must have a name!']
        },
        authors: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'Author'
                }
            ],
            validate: {
                validator: async (value: string[]) => {
                    if (value.length === 0) return false;

                    const count = await AuthorModel.countDocuments({
                        _id: { $in: value }
                    });

                    return count === value.length;
                },
                message: 'Author id is not valid!'
            }
        },
        yearOfPublication: {
            type: Number,
            required: [true, 'Book must have a year of publication!'],
            validate: {
                validator: (val: number) =>
                    Number.isInteger(val) &&
                    val >= 1 &&
                    val <= new Date().getUTCFullYear(),
                message: 'Year of publication is not valid!'
            }
        },
        languages: [
            {
                type: String,
                enum: {
                    values: Object.values(Languages),
                    message: 'Language is not valid!'
                }
            }
        ],
        description: {
            type: String,
            trim: true
        },
        avgScore: {
            type: Number,
            validate: [Number.isInteger, 'Average score must be an integer number!'],
            min: [1, 'Average score can not be less than 1!'],
            max: [5, 'Average score can not be greater than 5!']
        },
        numOfReviews: {
            type: Number,
            validate: [
                Number.isInteger,
                'Number of reviews must be an integer number!'
            ],
            min: [1, 'Number of reviews can not be less than 1!']
        }
    },
    {
        timestamps: true,
        toJSON: { versionKey: false },
        toObject: { versionKey: false }
    }
);

// Indexes
bookSchema.index({ title: 1 });
bookSchema.index({ authors: 1 });
bookSchema.index({ yearOfPublication: 1 });
bookSchema.index({ languages: 1 });

// Static Methods
bookSchema.statics.calculateScore = async function (bookId: string) {
    const scoreStat: { numOfReviews: number; avgScore: number }[] =
        await ReviewModel.aggregate()
            .match({
                book: new Types.ObjectId(bookId)
            })
            .group({
                _id: '$book',
                avgScore: {
                    $avg: '$score'
                },
                numOfReviews: {
                    $sum: 1
                }
            })
            .project({
                avgScore: { $round: ['$avgScore'] },
                numOfReviews: 1
            });

    let updateBody: Record<string, unknown> = {};
    if (scoreStat.length === 0) {
        updateBody = { $unset: { avgScore: '', numOfReviews: '' } };
    } else {
        updateBody = {
            avgScore: scoreStat[0].avgScore,
            numOfReviews: scoreStat[0].numOfReviews
        };
    }

    await this.findByIdAndUpdate(bookId, updateBody, {
        new: true,
        runValidators: true
    });
};

const BookModel = model<BookType, BookStatics>('Book', bookSchema);

export default BookModel;
