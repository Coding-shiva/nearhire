const express = require('express');
const router = express.Router();
const {
  getNearbyJobs,
  getAllJobs,
  getWalkInJobs,
  getJobById,
  saveJob,
  getSavedJobs,
  reportJob,
  getHomeFeed,
} = require('../controllers/jobController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.get('/nearby', optionalAuth, getNearbyJobs);
router.get('/walk-ins', optionalAuth, getWalkInJobs);
router.get('/home-feed', optionalAuth, getHomeFeed);
router.get('/user/saved', protect, getSavedJobs);
router.get('/', optionalAuth, getAllJobs);
router.get('/:id', optionalAuth, getJobById);
router.post('/:id/save', protect, saveJob);
router.post('/:id/report', optionalAuth, reportJob);

module.exports = router;
