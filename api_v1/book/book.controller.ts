import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/error/AppError';
import GetAllDocuments from '../../utils/getAllDocuments';
import { AuthorSummaryType } from '../author/schema/author.type';
import BookModel from './schema/book.model';
import { BookType } from './schema/book.type';
import {
    createBookBodyValidator,
    updateBookBodyValidator
} from './schema/book.bodyValidator';

export const getBooks = catchAsync(async (req, res) => {
    const criteria: Record<string, unknown> = {};
    if (req.query.title) {
        criteria.title = { $regex: req.query.title, $options: 'i' };
        delete req.query.title;
    }

    const getAllDocs = await GetAllDocuments.getInstance(
        BookModel,
        req.query,
        criteria
    );
    const books = await getAllDocs
        .run()
        .populate<AuthorSummaryType>('authors', 'name avatarURL');
    const totalResults = await getAllDocs.countDocuments();

    res.status(200).json({
        status: 'success',
        results: books.length,
        totalResults,
        data: books
    });
});

export const getBooksStatByLang = catchAsync(async (req, res) => {
    const statistics = await BookModel.aggregate()
        .unwind('languages')
        .group({
            _id: '$languages',
            count: {
                $sum: 1
            },
            startYear: { $min: '$yearOfPublication' },
            endYear: { $max: '$yearOfPublication' }
        })
        .project({
            language: '$_id',
            _id: 0,
            count: 1,
            startYear: 1,
            endYear: 1
        })
        .sort({
            count: -1
        })
        .allowDiskUse(true);

    res.status(200).json({
        status: 'success',
        data: statistics
    });
});

export const createBook = catchAsync(async (req, res) => {
    await createBookBodyValidator.validateAsync(req.body);

    const { title, authors, languages, yearOfPublication, description }: BookType =
        req.body;

    const newBook = await BookModel.create({
        title,
        authors,
        languages,
        yearOfPublication,
        description
    });

    const newBookPopulated = await BookModel.findById(newBook.id).populate<{
        authors: AuthorSummaryType[];
    }>('authors', 'name avatarURL');

    res.status(200).json({
        status: 'success',
        message: 'Book created successfully!',
        data: newBookPopulated
    });
});

export const updateBook = catchAsync(async (req, res) => {
    await updateBookBodyValidator.validateAsync(req.body);

    const updateBody: Record<string, unknown> = {};
    ['title', 'authors', 'languages', 'yearOfPublication', 'description'].forEach(
        el => {
            if (el in req.body) {
                updateBody[el] = req.body[el];
            }
        }
    );

    const updatedBook = await BookModel.findByIdAndUpdate(
        req.params.bookId,
        updateBody,
        { new: true, runValidators: true }
    ).populate<{ authors: AuthorSummaryType[] }>('authors', 'name avatarURL');

    if (!updatedBook) throw AppError.notFound('Book');

    res.status(200).json({
        status: 'success',
        message: 'Book updated successfully!',
        data: updatedBook
    });
});
