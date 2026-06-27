const simulator = require('../services/notificationSimulator');
const classificationEngine = require('../services/classificationEngine');
const deliveryManager = require('../services/deliveryManager');
const Rule = require('../models/Rule');
const User = require('../models/User');

exports.startSimulation = async (req, res, next) => {
  try {
    const { speedMs = 5000 } = req.body || {};
    
    const user = await User.findOne();
    if (!user) throw new Error("No test user found. Run seed script.");
    const rules = await Rule.find({ userId: user._id, isActive: true });

    simulator.start(speedMs, async (rawNotification) => {
      rawNotification.userId = user._id;
      
      // Classify with behavioral learning (Layer 3)
      const { priority, score, explanation } = await classificationEngine.classify(rawNotification, rules, user._id);
      
      // Deliver & Save
      const saved = await deliveryManager.processAndDeliver(rawNotification, priority, score, explanation);
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
    const { priority, score, explanation } = await classificationEngine.classify(rawNotification, rules, user._id);
    const saved = await deliveryManager.processAndDeliver(rawNotification, priority, score, explanation);
    
    res.json(saved);
  } catch (error) {
    next(error);
  }
};
