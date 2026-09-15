const express = require('express');
const router = express.Router();
const {
  getStats,
  verifyJob,
  archiveJob,
  getJobReports,
  getSources,
  createSource,
  toggleSource,
  getIngestionLogs,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/stats', getStats);
router.post('/jobs/:id/verify', verifyJob);
router.post('/jobs/:id/archive', archiveJob);
router.get('/reports', getJobReports);
router.get('/sources', getSources);
router.post('/sources', createSource);
router.put('/sources/:id/toggle', toggleSource);
router.get('/ingestion-logs', getIngestionLogs);

module.exports = router;
