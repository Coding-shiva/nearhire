const express = require('express');
const router = express.Router();
const {
  postJob,
  getEmployerJobs,
  updateJob,
  getJobApplicants,
} = require('../controllers/employerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('EMPLOYER', 'ADMIN'));

router.post('/jobs', postJob);
router.get('/jobs', getEmployerJobs);
router.put('/jobs/:id', updateJob);
router.get('/jobs/:id/applicants', getJobApplicants);

module.exports = router;
