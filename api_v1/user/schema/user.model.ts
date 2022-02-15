import { Document, model, Schema } from 'mongoose';
import { hash, compare } from 'bcryptjs';
import validator from 'validator';
import { UserType } from './user.type';
import isPasswordSecure from '../../../utils/isPasswordSecure';

const userSchema = new Schema<UserType>(
    {
        email: {
            type: String,
            required: [true, 'Provide an email!'],
            validate: [validator.isEmail, 'Email is not valid!']
        },
        password: {
            type: String,
            trim: true,
            required: [true, 'Provide a password!'],
            validate: isPasswordSecure,
            select: false
        },
        passwordChangedAt: {
            type: Date,
            select: false
        },
        avatarURL: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        toJSON: { versionKey: false },
        toObject: { versionKey: false }
    }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ isActive: 1 });

// Middlewares
userSchema.pre<UserType & Document>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    this.password = await hash(this.password, 12);

    return next();
});

userSchema.pre<UserType & Document>('save', function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }

    this.passwordChangedAt = new Date();

    return next();
});

// Methods
userSchema.methods.checkPassword = async function (candidatePassword: string) {
    return await compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
    if (this.passwordChangedAt) {
        const convertedTimestamp = parseInt(this.passwordChangedAt.getTime()) / 1000;
        return JWTTimestamp < convertedTimestamp;
    }

    return false;
};

const UserModel = model<UserType>('User', userSchema);

export default UserModel;
