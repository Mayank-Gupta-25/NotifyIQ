const express = require('express');
const router = express.Router();
const { startSimulation, stopSimulation, sendOne } = require('../controllers/simulatorController');

router.post('/start', startSimulation);
router.post('/stop', stopSimulation);
router.post('/send', sendOne);

module.exports = router;
