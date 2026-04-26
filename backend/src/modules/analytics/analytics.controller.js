import Ticket from '../ticket/ticket.model.js';

// @desc    Get ticket analytics
// @route   GET /api/analytics/tickets
// @access  Private
export const getTicketAnalytics = async (req, res) => {
  try {
    const today = new Date();
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);

    const tickets = await Ticket.find({
      createdAt: { $gte: last7Days }
    });

    // Group by day
    const dataByDay = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayName = days[d.getDay()];
      dataByDay[dayName] = { name: dayName, new: 0, resolved: 0 };
    }

    tickets.forEach(ticket => {
      const dayName = days[ticket.createdAt.getDay()];
      if (dataByDay[dayName]) {
        dataByDay[dayName].new += 1;
        if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
          dataByDay[dayName].resolved += 1;
        }
      }
    });

    const result = Object.values(dataByDay);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
