const JobAlert = require('../models/JobAlert');
const Notification = require('../models/Notification');
const { resolveKnownLocation } = require('../utils/geoUtils');
const { success, error } = require('../utils/apiResponse');

/**
 * @desc    Create a job alert
 * @route   POST /api/alerts
 */
const createAlert = async (req, res, next) => {
  try {
    const {
      title,
      category,
      skills,
      experienceLevel,
      minSalary,
      locationName,
      latitude,
      longitude,
      radiusKm = 25,
      emailNotification = true,
      inAppNotification = true,
    } = req.body;

    let coordinates = [77.3649, 28.6280]; // Default Noida
    if (latitude && longitude) {
      coordinates = [parseFloat(longitude), parseFloat(latitude)];
    } else if (locationName) {
      const known = resolveKnownLocation(locationName);
      if (known) {
        coordinates = [known.lng, known.lat];
      }
    }

    const alert = await JobAlert.create({
      user: req.user._id,
      title: title || `${category || 'All'} Jobs near ${locationName || 'Noida'}`,
      category: category || '',
      skills: Array.isArray(skills) ? skills : [],
      experienceLevel: experienceLevel || '',
      minSalary: minSalary ? parseFloat(minSalary) : 0,
      locationName: locationName || 'Noida Sector 62',
      location: {
        type: 'Point',
        coordinates,
      },
      radiusKm: parseFloat(radiusKm),
      emailNotification,
      inAppNotification,
    });

    return success(res, alert, 'Job alert created successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get user's job alerts
 * @route   GET /api/alerts
 */
const getMyAlerts = async (req, res, next) => {
  try {
    const alerts = await JobAlert.find({ user: req.user._id }).sort({ createdAt: -1 });
    return success(res, alerts, 'Job alerts retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Toggle or update job alert
 * @route   PUT /api/alerts/:id
 */
const updateAlert = async (req, res, next) => {
  try {
    const alert = await JobAlert.findOne({ _id: req.params.id, user: req.user._id });
    if (!alert) return error(res, 'Alert not found', 404);

    const { active, radiusKm, minSalary, emailNotification, inAppNotification } = req.body;
    if (active !== undefined) alert.active = active;
    if (radiusKm !== undefined) alert.radiusKm = radiusKm;
    if (minSalary !== undefined) alert.minSalary = minSalary;
    if (emailNotification !== undefined) alert.emailNotification = emailNotification;
    if (inAppNotification !== undefined) alert.inAppNotification = inAppNotification;

    await alert.save();
    return success(res, alert, 'Alert updated');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete job alert
 * @route   DELETE /api/alerts/:id
 */
const deleteAlert = async (req, res, next) => {
  try {
    const alert = await JobAlert.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!alert) return error(res, 'Alert not found', 404);
    return success(res, null, 'Alert deleted successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get user notifications
 * @route   GET /api/alerts/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });

    return success(res, { notifications, unreadCount }, 'Notifications retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Mark notifications as read
 * @route   POST /api/alerts/notifications/mark-read
 */
const markNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true, readAt: new Date() });
    return success(res, null, 'Notifications marked as read');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAlert,
  getMyAlerts,
  updateAlert,
  deleteAlert,
  getNotifications,
  markNotificationsRead,
};
