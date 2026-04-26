import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['CREATED', 'UPDATED', 'DELETED', 'COMMENTED', 'STATUS_CHANGED', 'ASSIGNED']
  },
  // Human-readable ticket number e.g. "PROJ-100"
  entityId: {
    type: String,
    required: true,
  },
  user: {
    name: { type: String, default: 'Unknown' },
    avatar: { type: String, default: '' }
  },
  details: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Index for fast retrieval of activity feeds
activitySchema.index({ createdAt: -1 });
activitySchema.index({ entityId: 1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
