import path from 'path';
import { readJSON } from 'fs-extra';
import { connect, disconnect } from 'mongoose';
import AdminModel from '../api_v1/admin/schema/admin.model';
import AuthorModel from '../api_v1/author/schema/author.model';
import BookModel from '../api_v1/book/schema/book.model';
import ReviewModel from '../api_v1/review/schema/review.model';
import UserModel from '../api_v1/user/schema/user.model';

(async () => {
    try {
        connect('mongodb://localhost:27017/Lector_2');
        console.log('⚡Database connection established successfully.');

        console.log('⚡Importing data to database ...');
        const admins = await readJSON(path.resolve(__dirname, 'db/admins.json'));
        await AdminModel.create(admins);

        const authors = await readJSON(path.resolve(__dirname, 'db/authors.json'));
        await AuthorModel.create(authors);

        const books = await readJSON(path.resolve(__dirname, 'db/books.json'));
        await BookModel.create(books);

        const users = await readJSON(path.resolve(__dirname, 'db/users.json'));
        await UserModel.create(users);

        const reviews = await readJSON(path.resolve(__dirname, 'db/reviews.json'));
        await ReviewModel.create(reviews);

        await disconnect();
        console.log('⚡All data imported to database successfully.');
    } catch (error) {
        console.log(
            '❌ Something went wrong in importing data. Please drop "Lector" db (if exists) and try again!'
        );
    } finally {
        process.exit(0);
    }
})();
