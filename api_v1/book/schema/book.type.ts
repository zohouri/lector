import { Schema } from 'mongoose';
import Languages from './languages.enum';

export type BookType = {
    title: string;
    authors: [Schema.Types.ObjectId];
    languages: [Languages];
    yearOfPublication: number;
    description: string;
    avgScore: number;
    numOfReviews: number;
    createdAt: Date;
    updatedAt: Date;
};

export type BookSummaryType = {
    title: string;
};
