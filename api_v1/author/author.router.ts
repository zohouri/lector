import { Router } from 'express';
import { protect, restrictTo } from '../auth/auth.controller';
import * as authorController from './author.controller';

const authorRouter = Router();

authorRouter.use(protect);

authorRouter
    .route('/')
    .get(authorController.getAuthors)
    .post(restrictTo('admin'), authorController.createAuthor);

authorRouter
    .route('/:authorId')
    .patch(restrictTo('admin'), authorController.updateAuthor);

export default authorRouter;
