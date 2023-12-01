const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'maybe you forget to write'],
    minlength: [1, 'maybe you forget to write'],
    maxlength: [500, 'the post should not be more than 500 letters'],
  },
  publisher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  publishedAt: {
    type: Date,
    default: Date.now(),
  },
  reacts: [
    {
      react: {
        type: String,
        enum: ['like', 'love', 'support', 'sad', 'angry'],
        required: true,
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
      },
    },
  ],
  comments: [
    {
      content: {
        type: String,
        maxlength: [150, 'The maximum length is 150 characters'],
        required: [true, 'A comment must have at least 1 character'],
      },
      commenter: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
      },
      issuedAt: {
        type: Date,
        default: Date.now(),
        required: true,
      },
      reacts: [
        {
          react: {
            type: String,
            enum: ['like', 'love', 'support', 'sad', 'angry'],
            required: true,
          },
          user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
          },
        },
      ],
    },
  ],
});

const Post = mongoose.model('Post', postSchema);

// Post.createIndex();

module.exports = Post;
