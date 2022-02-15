import { model, Schema } from 'mongoose';
import validator from 'validator';
import { AuthorType } from './author.type';

const authorSchema = new Schema<AuthorType>(
    {
        name: {
            type: String,
            trim: true,
            required: [true, 'Author must have a name!']
        },
        birthDate: {
            type: Date,
            required: [true, 'Author must have a birthDate!']
        },
        deathDate: {
            type: Date
        },
        bio: {
            type: String,
            trim: true
        },
        avatarURL: {
            type: String,
            trim: true,
            validate: [validator.isURL, 'Avatar URL is not valid!']
        }
    },
    {
        timestamps: true,
        toJSON: { versionKey: false },
        toObject: { versionKey: false }
    }
);

// Indexes
authorSchema.index({ name: 1 });

const AuthorModel = model<AuthorType>('Author', authorSchema);

export default AuthorModel;
