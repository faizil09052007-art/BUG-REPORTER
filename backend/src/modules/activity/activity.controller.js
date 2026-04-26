import Activity from './activity.model.js';
import Ticket from '../ticket/ticket.model.js';

// @desc    Get all activities
// @route   GET /api/activities
// @access  Private
export const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(20);
      
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
