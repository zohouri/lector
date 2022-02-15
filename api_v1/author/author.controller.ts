import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/error/AppError';
import GetAllDocuments from '../../utils/getAllDocuments';
import AuthorModel from './schema/author.model';
import { AuthorType } from './schema/author.type';
import {
    createAuthorBodyValidator,
    updateAuthorBodyValidator
} from './schema/author.bodyValidator';

export const getAuthors = catchAsync(async (req, res) => {
    const criteria: Record<string, unknown> = {};
    if (req.query.name) {
        criteria.name = { $regex: req.query.name, $options: 'i' };
        delete req.query.name;
    }

    const getAllDocuments = await GetAllDocuments.getInstance(
        AuthorModel,
        req.query,
        criteria
    );

    const authors = await getAllDocuments.run();
    const totalResults = await getAllDocuments.countDocuments();

    res.status(200).json({
        results: authors.length,
        totalResults,
        data: authors
    });
});

export const createAuthor = catchAsync(async (req, res) => {
    await createAuthorBodyValidator.validateAsync(req.body);
    const { name, birthDate, deathDate, bio, avatarURL }: AuthorType = req.body;

    const newAuthor = await AuthorModel.create({
        name,
        birthDate,
        deathDate,
        bio,
        avatarURL
    });

    res.status(200).json({
        status: 'success',
        message: 'Author created successfully!',
        data: newAuthor
    });
});

export const updateAuthor = catchAsync(async (req, res) => {
    await updateAuthorBodyValidator.validateAsync(req.body);

    const updateBody: Record<string, unknown> = {};
    ['name', 'birthDate', 'deathDate', 'bio', 'avatarURL'].forEach(el => {
        if (el in req.body) {
            updateBody[el] = req.body[el];
        }
    });

    const updatedAuthor = await AuthorModel.findByIdAndUpdate(
        req.params.authorId,
        updateBody,
        { new: true, runValidators: true }
    );

    if (!updatedAuthor) {
        throw AppError.notFound('Author');
    }

    res.status(200).json({
        status: 'success',
        message: 'Author updated successfully!',
        data: updatedAuthor
    });
});
