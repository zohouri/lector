import { Types } from 'mongoose';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/error/AppError';
import GetAllDocuments from '../../utils/getAllDocuments';
import BookModel from '../book/schema/book.model';
import { BookSummaryType } from '../book/schema/book.type';
import { UserSummaryType } from '../user/schema/user.type';
import {
    createReviewBodyValidator,
    updateReviewBodyValidator
} from './schema/review.bodyValidator';
import ReviewModel from './schema/review.model';
import ReviewType from './schema/review.type';

export const getReviews = catchAsync(async (req, res) => {
    const getAllDocs = await GetAllDocuments.getInstance(ReviewModel, req.query);
    const reviews = await getAllDocs.run().populate<{
        user: UserSummaryType & { _id: Types.ObjectId };
        book: BookSummaryType & { _id: Types.ObjectId };
    }>([
        { path: 'user', select: 'email avatarURL' },
        { path: 'book', select: 'title' }
    ]);
    const totalResults = await getAllDocs.countDocuments();

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        totalResults,
        data: reviews
    });
});

export const createReview = catchAsync(async (req, res) => {
    await createReviewBodyValidator.validateAsync(req.body);

    const { book, score, content }: ReviewType = req.body;

    const isReviewExist = await ReviewModel.findOne({ user: req.user?.id, book });
    if (isReviewExist) {
        throw new AppError(400, 'You have already wrote a review for this book!');
    }

    const newReview = await ReviewModel.create({
        user: req.user?.id,
        book,
        score,
        content
    });

    await BookModel.calculateScore(String(book));

    const newReviewPopulated = await ReviewModel.findById(newReview.id).populate<{
        user: UserSummaryType & { _id: Types.ObjectId };
        book: BookSummaryType & { _id: Types.ObjectId };
    }>([
        { path: 'user', select: 'email avatarURL' },
        { path: 'book', select: 'title' }
    ]);

    res.status(200).json({
        status: 'success',
        message: 'Review created successfully!',
        data: newReviewPopulated
    });
});

export const updateReview = catchAsync(async (req, res) => {
    await updateReviewBodyValidator.validateAsync(req.body);

    const updateBody: Record<string, unknown> = {};
    ['score', 'content'].forEach(el => {
        if (el in req.body) {
            updateBody[el] = req.body[el];
        }
    });

    const updatedReview = await ReviewModel.findOneAndUpdate(
        { _id: req.params.reviewId, user: req.user!.id },
        updateBody,
        { new: true, runValidators: true }
    ).populate<{
        user: UserSummaryType & { _id: Types.ObjectId };
        book: BookSummaryType & { _id: Types.ObjectId };
    }>([
        { path: 'user', select: 'email avatarURL' },
        { path: 'book', select: 'title' }
    ]);

    if (!updatedReview) throw AppError.notFound('Review');

    await BookModel.calculateScore(updatedReview.book._id.toString());

    res.status(200).json({
        status: 'success',
        message: 'Review updated successfully!',
        data: updatedReview
    });
});

export const deleteReview = catchAsync(async (req, res) => {
    const criteria: Record<string, unknown> = { _id: req.params.reviewId };
    if (req.user!.role !== 'admin') {
        criteria.user = req.user!.id;
    }

    const deletedReview = await ReviewModel.findOneAndDelete(criteria).populate<{
        user: UserSummaryType & { _id: Types.ObjectId };
        book: BookSummaryType & { _id: Types.ObjectId };
    }>([
        { path: 'user', select: 'email avatarURL' },
        { path: 'book', select: 'title' }
    ]);

    if (!deletedReview) throw AppError.notFound('Review');

    await BookModel.calculateScore(deletedReview.book._id.toString());

    res.status(200).json({
        status: 'success',
        message: 'Review deleted successfully!',
        data: deletedReview
    });
});
