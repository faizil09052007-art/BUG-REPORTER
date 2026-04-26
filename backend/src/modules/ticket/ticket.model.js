import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  status: {
    type: String,
    enum: ['New', 'In-Progress', 'Resolved', 'Closed'],
    default: 'New'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  tags: {
    type: [String],
    index: true
  },
  assignedAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reporter: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    avatar: String
  },
  attachments: [{
    url: String,
    filename: String,
    mimetype: String
  }],
  statusHistory: [{
    oldStatus: String,
    newStatus: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Pre-save hook to generate human-readable ticket number
ticketSchema.pre('save', async function(next) {
  if (this.isNew && !this.ticketNumber) {
    const lastTicket = await this.constructor.findOne({}, {}, { sort: { 'createdAt' : -1 } });
    if (lastTicket && lastTicket.ticketNumber) {
      const lastNumber = parseInt(lastTicket.ticketNumber.split('-')[1]);
      this.ticketNumber = `PROJ-${lastNumber + 1}`;
    } else {
      this.ticketNumber = 'PROJ-100';
    }
  }
  next();
});

// Indexes for performance optimization
ticketSchema.index({ assignedAgentId: 1, status: 1 });
ticketSchema.index({ 'reporter.id': 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
