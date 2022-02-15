import { Router } from 'express';
import { protect, restrictTo } from '../auth/auth.controller';
import * as reviewController from './review.controller';

const reviewRouter = Router();

reviewRouter.use(protect);

reviewRouter
    .route('/')
    .get(reviewController.getReviews)
    .post(restrictTo('user'), reviewController.createReview);

reviewRouter
    .route('/:reviewId')
    .patch(restrictTo('user'), reviewController.updateReview)
    .delete(reviewController.deleteReview);

export default reviewRouter;
