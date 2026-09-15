const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, applyForJob);
router.get('/', protect, getMyApplications);
router.put('/:id/status', protect, updateApplicationStatus);

module.exports = router;
