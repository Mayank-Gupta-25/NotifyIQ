const express = require('express');
const router = express.Router();
const { getSummary, getTrends, getBehaviorReport } = require('../controllers/analyticsController');

router.get('/summary', getSummary);
router.get('/trends', getTrends);
router.get('/behavior', getBehaviorReport);

module.exports = router;
