const Notification = require('../models/Notification');
const User = require('../models/User');
const behaviorTracker = require('../services/behaviorTracker');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find().sort({ timestamp: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const notification = await Notification.findByIdAndUpdate(id, { status }, { new: true });
    
    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    // Map status to user action for behavior tracking
    const actionMap = {
      'dismissed': 'dismissed',
      'archived': 'dismissed',
      'read': 'opened',
      'snoozed': 'snoozed'
    };

    const action = actionMap[status];
    if (action) {
      const user = await User.findOne();
      if (user) {
        await behaviorTracker.logAction(user._id, notification, action);
      }
    }

    res.json(notification);
  } catch (error) {
    next(error);
  }
};

exports.clearAll = async (req, res, next) => {
  try {
    await Notification.deleteMany({});
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    next(error);
  }
};
