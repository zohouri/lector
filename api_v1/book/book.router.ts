import { Router } from 'express';
import { protect, restrictTo } from '../auth/auth.controller';
import * as bookController from './book.controller';

const bookRouter = Router();

bookRouter.use(protect);

bookRouter
    .route('/')
    .get(bookController.getBooks)
    .post(restrictTo('admin'), bookController.createBook);

bookRouter.route('/statByLang').get(bookController.getBooksStatByLang);

bookRouter.route('/:bookId').patch(restrictTo('admin'), bookController.updateBook);

export default bookRouter;
