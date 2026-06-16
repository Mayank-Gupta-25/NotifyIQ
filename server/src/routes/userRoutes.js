const express = require('express');
const router = express.Router();
const { getPreferences, updatePreferences, getFocusMode, setFocusMode } = require('../controllers/userController');

router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.get('/focus-mode', getFocusMode);
router.put('/focus-mode', setFocusMode);

module.exports = router;
