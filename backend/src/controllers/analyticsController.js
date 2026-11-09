import Pond from '../models/Pond.js';
import FeedRecord from '../models/FeedRecord.js';
import Alert from '../models/Alert.js';
import WaterQualityRecord from '../models/WaterQualityRecord.js';

// @desc    Get complete Farmer Dashboard metrics
// @route   GET /api/analytics/dashboard
export const getFarmerDashboard = async (req, res) => {
  try {
    const farmerId = req.user._id;

    // 1. Ponds summary
    const ponds = await Pond.find({ farmer: farmerId }).sort({ createdAt: -1 });
    const totalPonds = ponds.length;
    const normalPonds = ponds.filter((p) => p.status === 'normal').length;
    const warningPonds = ponds.filter((p) => p.status === 'warning').length;
    const criticalPonds = ponds.filter((p) => p.status === 'critical').length;

    // 2. Feed metrics (today, weekly, monthly)
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayFeed = await FeedRecord.aggregate([
      { $match: { farmer: farmerId, date: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$totalDailyKg' } } }
    ]);
    const todayTotalFeed = todayFeed.length > 0 ? Number(todayFeed[0].total.toFixed(1)) : 0;

    const weeklyFeed = await FeedRecord.aggregate([
      { $match: { farmer: farmerId, date: { $gte: sevenDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$totalDailyKg' } } }
    ]);
    const weeklyTotalFeed = weeklyFeed.length > 0 ? Number(weeklyFeed[0].total.toFixed(1)) : 0;

    const monthlyFeed = await FeedRecord.aggregate([
      { $match: { farmer: farmerId, date: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$totalDailyKg' } } }
    ]);
    const monthlyTotalFeed = monthlyFeed.length > 0 ? Number(monthlyFeed[0].total.toFixed(1)) : 0;

    // 3. Recent Alerts
    const recentAlerts = await Alert.find({ farmer: farmerId })
      .populate('pond', 'name pondNumber')
      .sort({ timestamp: -1 })
      .limit(6);

    const unreadAlertsCount = await Alert.countDocuments({
      farmer: farmerId,
      isRead: false
    });

    // 4. Multi-day telemetry trends across farm for charts
    const recentReadings = await WaterQualityRecord.find({ farmer: farmerId })
      .populate('pond', 'name pondNumber')
      .sort({ timestamp: -1 })
      .limit(20);

    const chartTrend = recentReadings.reverse().map((r) => ({
      time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      pondName: r.pond ? r.pond.name : 'Pond',
      temperature: r.temperature,
      pH: r.pH,
      dissolvedOxygen: r.dissolvedOxygen,
      turbidity: r.turbidity,
      healthScore: r.healthScore,
      isSimulated: r.isSimulated
    }));

    res.json({
      success: true,
      data: {
        pondsSummary: {
          total: totalPonds,
          normal: normalPonds,
          warning: warningPonds,
          critical: criticalPonds
        },
        feedSummary: {
          todayKg: todayTotalFeed,
          weeklyKg: weeklyTotalFeed,
          monthlyKg: monthlyTotalFeed
        },
        unreadAlertsCount,
        recentAlerts,
        ponds,
        telemetryTrends: chartTrend
      }
    });
  } catch (error) {
    console.error('Farmer dashboard metrics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Compare multiple ponds side-by-side
// @route   GET /api/analytics/compare
export const getPondComparison = async (req, res) => {
  try {
    const farmerId = req.user._id;
    const { pondIds } = req.query;

    let query = { farmer: farmerId };
    if (pondIds) {
      const idArray = pondIds.split(',').filter(Boolean);
      if (idArray.length > 0) {
        query._id = { $in: idArray };
      }
    }

    const ponds = await Pond.find(query);

    const comparisonData = await Promise.all(
      ponds.map(async (pond) => {
        // Calculate Days of Culture (DOC)
        const stockingTime = new Date(pond.stockingDate).getTime();
        const nowTime = new Date().getTime();
        const doc = Math.max(0, Math.floor((nowTime - stockingTime) / (1000 * 60 * 60 * 24)));

        // Total feed consumed to date
        const feedAgg = await FeedRecord.aggregate([
          { $match: { pond: pond._id } },
          { $group: { _id: null, total: { $sum: '$totalDailyKg' } } }
        ]);
        const totalFeedKg = feedAgg.length ? Number(feedAgg[0].total.toFixed(1)) : 0;

        // Alerts count
        const warningAlerts = await Alert.countDocuments({ pond: pond._id, severity: 'warning' });
        const criticalAlerts = await Alert.countDocuments({ pond: pond._id, severity: 'critical' });

        return {
          pondId: pond._id,
          name: pond.name,
          pondNumber: pond.pondNumber,
          species: pond.species,
          sizeHectares: pond.sizeHectares,
          shrimpCount: pond.shrimpCount,
          stockingDate: pond.stockingDate,
          doc,
          healthScore: pond.currentHealthScore,
          status: pond.status,
          totalFeedKg,
          lastReading: pond.lastReading || {
            temperature: null,
            pH: null,
            dissolvedOxygen: null,
            turbidity: null
          },
          alertsCount: {
            warning: warningAlerts,
            critical: criticalAlerts
          }
        };
      })
    );

    res.json({ success: true, count: comparisonData.length, data: comparisonData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
