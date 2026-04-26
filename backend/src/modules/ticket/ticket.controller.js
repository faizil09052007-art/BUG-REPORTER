import Ticket from './ticket.model.js';
import Activity from '../activity/activity.model.js';

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
export const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    
    const ticketObj = ticket.toObject();
    ticketObj.comments = ticketObj.comments || [];
    ticketObj.attachments = ticketObj.attachments || [];
    ticketObj.history = ticketObj.history || [];
    
    res.status(200).json(ticketObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = async (req, res) => {
  try {
    req.body.reporter = {
      id: req.user.id,
      name: req.user.name || 'Unknown',
      avatar: req.user.avatar || 'no-photo.jpg'
    };

    const ticket = await Ticket.create(req.body);

    // Log activity (fire-and-forget)
    Activity.create({
      action: 'CREATED',
      entityId: ticket.ticketNumber || ticket._id.toString(),
      user: { name: req.user.name || 'Unknown', avatar: req.user.avatar || '' },
      details: ticket.title
    }).catch(console.error);

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update ticket status
// @route   PATCH /api/tickets/:id/status
// @access  Private
export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    let oldStatus = ticket.status;

    // Record status history
    if (ticket.status !== status) {
      ticket.statusHistory.push({
        oldStatus: ticket.status,
        newStatus: status,
        changedBy: req.user.id
      });
      ticket.status = status;
    }

    await ticket.save();

    // Log activity (fire-and-forget)
    Activity.create({
      action: 'STATUS_CHANGED',
      entityId: ticket.ticketNumber || ticket._id.toString(),
      user: { name: req.user.name || 'Unknown', avatar: req.user.avatar || '' },
      details: `${oldStatus} → ${status}`
    }).catch(console.error);

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
