import { Router } from 'express';
import adminRouter from './admin/admin.router';
import authRouter from './auth/auth.router';
import authorRouter from './author/author.router';
import bookRouter from './book/book.router';
import reviewRouter from './review/review.router';
import userRouter from './user/user.router';

const router = Router();

router.use('/auth', authRouter);

router.use('/admin', adminRouter);

router.use('/user', userRouter);

router.use('/author', authorRouter);

router.use('/book', bookRouter);

router.use('/review', reviewRouter);

export default router;
