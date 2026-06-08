const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    // Fetch latest 50 notifications
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
