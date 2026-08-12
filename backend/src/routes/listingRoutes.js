const express = require('express');
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getListings);
router.post('/', protect, createListing);
router.get('/:id', protect, getListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
