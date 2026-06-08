const simulator = require('../services/notificationSimulator');
const classificationEngine = require('../services/classificationEngine');
const deliveryManager = require('../services/deliveryManager');
const Rule = require('../models/Rule');
const User = require('../models/User');

exports.startSimulation = async (req, res, next) => {
  try {
    const { speedMs = 5000 } = req.body || {}; // Default 1 notification every 5 seconds
    
    // Fetch test user and rules
    const user = await User.findOne();
    if (!user) throw new Error("No test user found. Run seed script.");
    const rules = await Rule.find({ userId: user._id, isActive: true });

    // Start simulator
    simulator.start(speedMs, async (rawNotification) => {
      rawNotification.userId = user._id;
      
      // 1. Classify
      const { priority, score } = await classificationEngine.classify(rawNotification, rules);
      
      // 2. Deliver & Save
      await deliveryManager.processAndDeliver(rawNotification, priority, score);
    });

    res.json({ message: `Simulation started at ${speedMs}ms interval` });
  } catch (error) {
    next(error);
  }
};

exports.stopSimulation = (req, res) => {
  simulator.stop();
  res.json({ message: 'Simulation stopped' });
};

exports.sendOne = async (req, res, next) => {
  try {
    const user = await User.findOne();
    const rules = await Rule.find({ userId: user._id, isActive: true });
    
    const rawNotification = { ...simulator.generateOne(), userId: user._id };
    const { priority, score } = await classificationEngine.classify(rawNotification, rules);
    const saved = await deliveryManager.processAndDeliver(rawNotification, priority, score);
    
    res.json(saved);
  } catch (error) {
    next(error);
  }
};
