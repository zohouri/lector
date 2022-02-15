"**Lector**" is a small sample project to introduce and review some of the literary masterpieces of the world.

This project consists of 4 parts:

1. **Authors**: Contains authors' information (name, date of birth and death, biography and image)

2. **Books**: Contains information about books (title, authors, languages, year of publication, description, average user scores, number of reviews submitted for the book)

3. **Reviews**: Includes user reviews (score between 1 and 5 and review text)

4. **Users**: Users can sign up using email and password. The hashed password, email and user avatar link are stored in the database.

In this project, two user levels are defined:

1. **Admin**: Ability to add, edit and view the list and statistics of books; Add, edit and view authors; View and delete user comments; View the list and the possibility of activating and deactivating users' accounts.

2. **User**: Ability to view the list and statistics of books; View the list of authors; Submit, edit and delete reviews for books.

<br/>To run apps (in development mode) you have to install [nodemon](https://www.npmjs.com/package/nodemon), [ts-node](https://www.npmjs.com/package/ts-node) globally:

    npm i nodemon,ts-node -g

To run the admin app (admin access) use the following command:

    npm run start-dev: admin

And to run the user app (user access) use the following command:

    npm run start-dev: user

<br />The API documentation is written according to the **OpenAPI** standard and is available as a **yaml** file in the docs folder.

To test the API, you can use the database in the mocks folder. To facilitate the import of the database, a script has been prepared that you can run with the following command:

    npm i -g ts-node
    npm run ./mocks/index.ts

Test admin info: username: **admin** / password: **123RTY@vbn**

Test user info: email: **sample@gmail.com** / password: **asd123QWE!**
