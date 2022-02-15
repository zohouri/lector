export type AuthorType = {
    name: string;
    birthDate: Date;
    deathDate?: Date;
    avatarURL?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
};

export type AuthorSummaryType = {
    name: string;
    avatarURL?: string;
};
