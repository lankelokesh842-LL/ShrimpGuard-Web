import Alert from '../models/Alert.js';

// @desc    Get alerts for logged in farmer or admin
// @route   GET /api/alerts
export const getAlerts = async (req, res) => {
  try {
    const { severity, isRead, pondId, limit = 50 } = req.query;
    let query = {};

    if (req.user.role !== 'admin') {
      query.farmer = req.user._id;
    }

    if (severity) query.severity = severity;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (pondId) query.pond = pondId;

    const alerts = await Alert.find(query)
      .populate('pond', 'name pondNumber')
      .populate('farmer', 'name farmLocation')
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    const unreadCount = await Alert.countDocuments({
      ...(req.user.role !== 'admin' ? { farmer: req.user._id } : {}),
      isRead: false
    });

    const criticalCount = await Alert.countDocuments({
      ...(req.user.role !== 'admin' ? { farmer: req.user._id } : {}),
      severity: 'critical',
      isRead: false
    });

    res.json({
      success: true,
      count: alerts.length,
      unreadCount,
      criticalCount,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark alert as read
// @route   PATCH /api/alerts/:id/read
export const markAlertRead = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    if (req.user.role !== 'admin' && alert.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    alert.isRead = true;
    await alert.save();

    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all alerts as read
// @route   PATCH /api/alerts/mark-all-read
export const markAllAlertsRead = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { farmer: req.user._id };
    await Alert.updateMany(query, { isRead: true });

    res.json({ success: true, message: 'All alerts marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
export const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    if (req.user.role !== 'admin' && alert.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await alert.deleteOne();
    res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
