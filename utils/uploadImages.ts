import { NextFunction, Response } from 'express-serve-static-core';
import { Request } from 'express';
import { ensureDir } from 'fs-extra';
import { nanoid } from 'nanoid';
import path from 'path';
import sharp from 'sharp';
import multer from 'multer';
import AppError from './error/AppError';

const uploadImagesToMemory = (fieldName: string, maxCount: number, maxSizeMB = 10) => {
    const multerStorage = multer.memoryStorage();

    const multerFilter = (
        req: Request,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback
    ) => {
        const { mimetype } = file;
        const acceptableExtensions = ['png', 'jpg', 'jpeg'];

        if (!mimetype || !mimetype.startsWith('image')) {
            cb(new AppError(400, 'Please upload image file!'));
        } else if (
            mimetype.split('/').length !== 2 ||
            !acceptableExtensions.includes(mimetype.split('/')[1])
        ) {
            cb(new AppError(400, 'The file must be in jpg or png format!'));
        } else {
            cb(null, true);
        }
    };

    const multerLimits = {
        fileSize: maxSizeMB * 1024 * 1024
    };

    const multerObj = multer({
        storage: multerStorage,
        fileFilter: multerFilter,
        limits: multerLimits
    });

    return multerObj.fields([{ name: fieldName, maxCount: maxCount }]);
};

const resizeAndSaveImage = async (imageBuffer: Buffer, dir: string) => {
    const fileName = `${nanoid()}.jpeg`;

    await sharp(imageBuffer)
        .rotate()
        .resize(320, 320, { fit: 'inside' })
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`${dir}/${fileName}`);

    return `${fileName}`;
};

const uploadImages =
    (fieldName: string, maxCount: number, dirToSave: string) =>
    (
        req: Request & { uploadedImagesLinks?: string[] },
        res: Response,
        next: NextFunction
    ) =>
        uploadImagesToMemory(fieldName, maxCount)(req, res, async err => {
            if (err) return next(err);

            if (!req.files) {
                return next(new AppError(400, 'Please upload image file!'));
            }

            await ensureDir(path.resolve(dirToSave));

            const inMemoryFiles = req.files as {
                [fieldName: string]: Express.Multer.File[];
            };

            const uploadedImagesLinks: string[] = [];
            await Promise.all(
                inMemoryFiles[fieldName].map(async (file: Express.Multer.File) => {
                    try {
                        const fileLink = await resizeAndSaveImage(
                            file.buffer,
                            dirToSave
                        );
                        uploadedImagesLinks.push(fileLink);
                    } catch (error) {
                        return next(
                            new AppError(
                                500,
                                'Something went wrong in uploading images!'
                            )
                        );
                    }
                })
            );

            if (uploadedImagesLinks.length === 0) {
                return next(
                    new AppError(500, 'Something went wrong in uploading images')
                );
            }

            req.uploadedImagesLinks = uploadedImagesLinks;

            next();
        });

export default uploadImages;
