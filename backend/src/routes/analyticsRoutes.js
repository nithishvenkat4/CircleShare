const express = require('express');
const { myDashboard, adminOverview } = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', protect, myDashboard);
router.get('/admin', protect, adminOnly, adminOverview);

module.exports = router;
