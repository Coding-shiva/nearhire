const express = require('express');
const router = express.Router();
const {
  createAlert,
  getMyAlerts,
  updateAlert,
  deleteAlert,
  getNotifications,
  markNotificationsRead,
} = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createAlert);
router.get('/', getMyAlerts);
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert);

router.get('/notifications', getNotifications);
router.post('/notifications/mark-read', markNotificationsRead);

module.exports = router;
