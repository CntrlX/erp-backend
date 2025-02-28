const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  comments: [{
    text: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Pre-save middleware to update employee's tasks
taskSchema.pre('save', async function(next) {
  if (this.isModified('assignee') && this.assignee) {
    const Employee = mongoose.model('Employee');
    await Employee.findByIdAndUpdate(
      this.assignee,
      { $addToSet: { tasks: this._id } }
    );
  }
  next();
});

// Pre-remove middleware to remove task from employee's tasks array
taskSchema.pre('remove', async function(next) {
  if (this.assignee) {
    const Employee = mongoose.model('Employee');
    await Employee.findByIdAndUpdate(
      this.assignee,
      { $pull: { tasks: this._id } }
    );
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task; 