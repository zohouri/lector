export type UserType = {
    email: string;
    password: string;
    passwordChangedAt?: Date;
    avatarURL?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    checkPassword(candidatePassword: string): Promise<boolean>;
    changedPasswordAfter(JWTTimestamp: number): boolean;
};

export type UserSummaryType = {
    email: string;
    avatarURL?: string;
};
