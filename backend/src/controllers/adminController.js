import User from '../models/User.js';
import Pond from '../models/Pond.js';
import Alert from '../models/Alert.js';
import WaterQualityRecord from '../models/WaterQualityRecord.js';
import FeedRecord from '../models/FeedRecord.js';

// @desc    Get all registered farmers
// @route   GET /api/admin/farmers
export const getAllFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Enhance each farmer with pond count and active alerts count
    const enhancedFarmers = await Promise.all(
      farmers.map(async (farmer) => {
        const pondCount = await Pond.countDocuments({ farmer: farmer._id });
        const criticalAlerts = await Alert.countDocuments({
          farmer: farmer._id,
          severity: 'critical',
          isRead: false
        });
        const warningAlerts = await Alert.countDocuments({
          farmer: farmer._id,
          severity: 'warning',
          isRead: false
        });

        return {
          ...farmer.toObject(),
          pondCount,
          activeAlerts: {
            critical: criticalAlerts,
            warning: warningAlerts,
            total: criticalAlerts + warningAlerts
          }
        };
      })
    );

    res.json({
      success: true,
      count: enhancedFarmers.length,
      data: enhancedFarmers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle farmer active / inactive status
// @route   PATCH /api/admin/farmers/:id/status
export const toggleFarmerStatus = async (req, res) => {
  try {
    const farmer = await User.findById(req.params.id);

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    if (farmer.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot modify status of an administrator' });
    }

    farmer.status = farmer.status === 'active' ? 'inactive' : 'active';
    await farmer.save();

    res.json({
      success: true,
      message: `Farmer status changed to ${farmer.status}`,
      data: {
        _id: farmer._id,
        name: farmer.name,
        email: farmer.email,
        status: farmer.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registered ponds across the platform
// @route   GET /api/admin/ponds
export const getAllPondsAdmin = async (req, res) => {
  try {
    const ponds = await Pond.find()
      .populate('farmer', 'name email mobile farmLocation status')
      .sort({ status: -1, createdAt: -1 });

    res.json({ success: true, count: ponds.length, data: ponds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get system-wide summary metrics for Admin Dashboard
// @route   GET /api/admin/metrics
export const getAdminMetrics = async (req, res) => {
  try {
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const activeFarmers = await User.countDocuments({ role: 'farmer', status: 'active' });
    const totalPonds = await Pond.countDocuments();

    const normalPonds = await Pond.countDocuments({ status: 'normal' });
    const warningPonds = await Pond.countDocuments({ status: 'warning' });
    const criticalPonds = await Pond.countDocuments({ status: 'critical' });

    const totalAlerts = await Alert.countDocuments();
    const activeCriticalAlerts = await Alert.countDocuments({ severity: 'critical', isRead: false });
    const activeWarningAlerts = await Alert.countDocuments({ severity: 'warning', isRead: false });

    // Recent critical/warning alerts
    const recentSystemAlerts = await Alert.find({ severity: { $in: ['warning', 'critical'] } })
      .populate('pond', 'name pondNumber')
      .populate('farmer', 'name mobile farmLocation')
      .sort({ timestamp: -1 })
      .limit(8);

    res.json({
      success: true,
      data: {
        farmers: {
          total: totalFarmers,
          active: activeFarmers
        },
        ponds: {
          total: totalPonds,
          normal: normalPonds,
          warning: warningPonds,
          critical: criticalPonds
        },
        alerts: {
          total: totalAlerts,
          criticalUnread: activeCriticalAlerts,
          warningUnread: activeWarningAlerts
        },
        recentAlerts: recentSystemAlerts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
