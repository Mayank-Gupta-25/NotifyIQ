const Rule = require('../models/Rule');
const User = require('../models/User');

exports.getRules = async (req, res, next) => {
  try {
    const user = await User.findOne();
    const rules = await Rule.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json(rules);
  } catch (error) {
    next(error);
  }
};

exports.createRule = async (req, res, next) => {
  try {
    const user = await User.findOne();
    const { type, value, priority } = req.body;
    const rule = await Rule.create({ userId: user._id, type, value, priority });
    res.status(201).json(rule);
  } catch (error) {
    next(error);
  }
};

exports.updateRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rule = await Rule.findByIdAndUpdate(id, req.body, { new: true });
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    res.json(rule);
  } catch (error) {
    next(error);
  }
};

exports.deleteRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Rule.findByIdAndDelete(id);
    res.json({ message: 'Rule deleted' });
  } catch (error) {
    next(error);
  }
};

exports.toggleRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rule = await Rule.findById(id);
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    rule.isActive = !rule.isActive;
    await rule.save();
    res.json(rule);
  } catch (error) {
    next(error);
  }
};
