const digestGenerator = require('../services/digestGenerator');
const Digest = require('../models/Digest');
const User = require('../models/User');

exports.generateNow = async (req, res, next) => {
  try {
    const user = await User.findOne(); // Grab our test user
    const digest = await digestGenerator.generateDailyDigest(user._id);
    
    if (!digest) {
      return res.status(200).json({ message: "No new low-priority notifications to digest." });
    }
    
    res.json(digest);
  } catch (error) {
    next(error);
  }
};

exports.getDigests = async (req, res, next) => {
  try {
    const digests = await Digest.find()
      .sort({ generatedAt: -1 })
      .populate('sections.notifications') // Populates full notification details
      .limit(10);
      
    res.json(digests);
  } catch (error) {
    next(error);
  }
};
