import { Document, model, Schema } from 'mongoose';
import { hash, compare } from 'bcryptjs';
import AdminType from './admin.type';
import isPasswordSecure from '../../../utils/isPasswordSecure';

const adminSchema = new Schema<AdminType>(
    {
        username: {
            type: String,
            trim: true,
            required: [true, 'Provide a username!']
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

adminSchema.index({ username: 1 }, { unique: true });

adminSchema.pre<AdminType & Document>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    this.password = await hash(this.password, 12);

    return next();
});

adminSchema.pre<AdminType & Document>('save', function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }

    this.passwordChangedAt = new Date();

    return next();
});

adminSchema.methods.checkPassword = async function (candidatePassword: string) {
    return await compare(candidatePassword, this.password);
};

adminSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
    if (this.passwordChangedAt) {
        const convertedTimestamp = parseInt(this.passwordChangedAt.getTime()) / 1000;
        return JWTTimestamp < convertedTimestamp;
    }

    return false;
};

const AdminModel = model<AdminType>('Admin', adminSchema);

export default AdminModel;
