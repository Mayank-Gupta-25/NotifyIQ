const User = require('../models/User');

exports.getPreferences = async (req, res, next) => {
  try {
    const user = await User.findOne();
    if (!user) return res.status(404).json({ error: 'No user found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const user = await User.findOne();
    if (!user) return res.status(404).json({ error: 'No user found' });

    // Update nested preferences
    if (req.body.digestTime) user.preferences.digestTime = req.body.digestTime;
    if (req.body.focusMode) user.preferences.focusMode = req.body.focusMode;
    if (req.body.timezone) user.preferences.timezone = req.body.timezone;

    await user.save();
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.getFocusMode = async (req, res, next) => {
  try {
    const user = await User.findOne();
    res.json({ focusMode: user.preferences.focusMode });
  } catch (error) {
    next(error);
  }
};

exports.setFocusMode = async (req, res, next) => {
  try {
    const { focusMode } = req.body;
    const user = await User.findOne();
    user.preferences.focusMode = focusMode;
    await user.save();
    res.json({ focusMode: user.preferences.focusMode });
  } catch (error) {
    next(error);
  }
};
