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
- **GET /users/:id:** Get user profile information.

### Posts

- **POST /posts:** Create a new post.
- **GET /posts/:id:** Get a specific post.
- **POST /posts/:id/like:** Like a post.
- **POST /posts/:id/comments:** Comment on a post.

### Reactions

- **POST /posts/:id/react:** React to a post.

## usage

1. Run the server:

   ```
   npm start
   ```

2. Use the API endpoints as described above.
