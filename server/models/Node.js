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
}, {
  timestamps: true,
});

export const Node = mongoose.model('Node', nodeSchema);