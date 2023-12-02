# Social Media Platform API (Backend)

This is the backend API for a Social Media Platform, built using Node.js, Express.js, and MongoDB. The API allows users to register, create posts, like posts, comment on posts, and follow other users.

## Features

- **User Management:**
  - User authentication, registration, and profile management.
- **Post Handling:**
  - Create, retrieve, and interact with posts (like, comment).
- **Comment System:**
  - Allow users to add comments to posts.
- **Reactions:**
  - Support multiple types of reactions (like, love, support, sad, angry).

## Tech Stack

- **Node.js:** Backend language.
- **Express.js:** Web framework for handling API routes.
- **MongoDB:** Database for storing user data, posts, comments, and reactions.
- **Mongoose (ODM):** For easier interaction with MongoDB.

## Project Structure

- `models/`: MongoDB data models (User, Post, Reaction).
- `routes/`: API routes for user management, posts, reactions, etc.
- `middlewares/`: Custom middleware functions (authentication, error handling).
- `config/`: Configuration files (MongoDB connection, etc.).

## Setup

1. Clone the repository:

   ```bash
    git clone <repository_url>
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up the environment variables:

   Create a `.env` file in the root of the project and add the following:

   ```
   MONGODB_URI=<your_mongodb_uri>
   JWT_SECRET=<your_jwt_secret>
   ```

## API Endpoints

### User

- **POST /register:** Register a new user.
- **POST /login:** User authentication.
- **POST /forgetPassword:** User forgot his password and reset it.
- **PATCH /updatePassword:** User update his password.
- **PATCH /updateMe:** User update his data.
- **PATCH /deleteMe:** User delete his profile.
- **GET /users/:id:** Get user profile information.
- **PATCH /users/:id:** Admin edit profile to make it modrator or a regular user.
- **delete /users/:id:** Admin delete profile.

### Posts

- **POST /posts:** Get all posts.
- **POST /posts:** Create a new post.
- **GET /posts/:id:** Get a specific post.
- **PSTCH /posts/:id:** Edit a post.
- **DELETE /posts/:id:** Delete a post.
- **POST /posts/:id/react:** React to a post, change your reaction or remove it.
- **POST /posts/:id/comment:** Comment on a post.
- **PATCH /posts/:id/comment/:commentId:** User edit his comment.
- **PATCH /posts/:id/comment/:commentId:** User delete his comment
- **POST /posts/:id/comment/:commentId/react:** React to a comment, change your reaction or remove it.

## usage

1. Run the server:

   ```
   npm start
   ```

2. Use the API endpoints as described above.
