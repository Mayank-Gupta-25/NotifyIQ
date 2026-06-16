const express = require('express');
const router = express.Router();
const { generateNow, getDigests } = require('../controllers/digestController');

router.post('/generate', generateNow);
router.get('/', getDigests);

module.exports = router;
