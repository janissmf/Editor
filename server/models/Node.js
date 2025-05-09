import mongoose from 'mongoose';

const nodeSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    default: null,
  },
  is_expanded: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
});

nodeSchema.index({ user_id: 1 });
nodeSchema.index({ parent_id: 1 });
nodeSchema.index({ order: 1 });

export const Node = mongoose.model('Node', nodeSchema);