const Notification = require('../models/Notification');
const BehaviorLog = require('../models/BehaviorLog');

exports.getSummary = async (req, res, next) => {
  try {
    const total = await Notification.countDocuments();
    const byPriority = await Notification.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    const byApp = await Notification.aggregate([
      { $group: { _id: '$sourceApp', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);
    const byCategory = await Notification.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const byStatus = await Notification.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Calculate "time saved" — each Low/Noise notification = ~3 seconds saved
    const suppressedCount = byPriority
      .filter(p => p._id === 'low' || p._id === 'noise')
      .reduce((sum, p) => sum + p.count, 0);
    const timeSavedSeconds = suppressedCount * 3;

    res.json({
      total,
      byPriority: Object.fromEntries(byPriority.map(p => [p._id, p.count])),
      byApp,
      byCategory,
      byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count])),
      timeSaved: {
        seconds: timeSavedSeconds,
        formatted: timeSavedSeconds >= 60
          ? `${Math.floor(timeSavedSeconds / 60)}m ${timeSavedSeconds % 60}s`
          : `${timeSavedSeconds}s`
      },
      suppressedCount
    });
  } catch (error) {
    next(error);
  }
};

exports.getTrends = async (req, res, next) => {
  try {
    // Get notifications grouped by hour for the last 24 hours
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const trends = await Notification.aggregate([
      { $match: { timestamp: { $gte: dayAgo } } },
      {
        $group: {
          _id: {
            hour: { $hour: '$timestamp' },
            priority: '$priority'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.hour': 1 } }
    ]);

    // Reshape into chart-friendly format
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hourData = { hour: `${i}:00`, critical: 0, important: 0, low: 0, noise: 0 };
      trends.filter(t => t._id.hour === i).forEach(t => {
        hourData[t._id.priority] = t.count;
      });
      return hourData;
    });

    res.json(hours);
  } catch (error) {
    next(error);
  }
};
