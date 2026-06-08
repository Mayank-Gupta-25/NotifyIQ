const express = require('express');
const router = express.Router();
const { getNotifications, updateStatus, clearAll } = require('../controllers/notificationController');

router.get('/', getNotifications);
router.patch('/:id/status', updateStatus);
router.delete('/clear', clearAll);

module.exports = router;
