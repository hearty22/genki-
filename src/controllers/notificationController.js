import Notification from '../models/Notification.js';

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id, read: false }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    // Make sure user owns the notification
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create a notification (for internal system use)
// @access  Internal
export const createNotification = async (userId, message, type = 'info') => {
  try {
    const newNotification = new Notification({
      user: userId,
      message,
      type
    });
    await newNotification.save();
    console.log('Notification created successfully.');
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-as-read
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });
    res.json({ msg: 'All notifications marked as read' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};