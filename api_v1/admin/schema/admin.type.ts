type AdminType = {
    username: string;
    password: string;
    passwordChangedAt?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    checkPassword(candidatePassword: string): Promise<boolean>;
    changedPasswordAfter(JWTTimestamp: number): boolean;
};

export default AdminType;
