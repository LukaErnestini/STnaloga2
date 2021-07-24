const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
    },
    tags: [
      {
        tag: {
          type: String,
          trim: true,
          maxlength: 16,
        },
      },
    ],
    parentListId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaskList',
    },
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
