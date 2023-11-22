const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'maybe you forget to write'],
    minlength: [1, 'maybe you forget to write'],
    maxlength: [500, 'the post should not be more than 500 letters'],
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  WritenAt: {
    type: Date,
    default: Date.now(),
  },
  Comments: {
    type: mongoose.Schema.ObjectId,
    ref: 'comment',
  },
});

const Post = mongoose.model('Post', postSchema);

// Post.createIndex();

module.exports = Post;
