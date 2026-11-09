import FeedRecord from '../models/FeedRecord.js';
import Pond from '../models/Pond.js';

// @desc    Log daily feed for a pond
// @route   POST /api/feed
export const logFeed = async (req, res) => {
  try {
    const { pondId, date, morningKg, afternoonKg, eveningKg, feedType, notes } = req.body;

    if (!pondId) {
      return res.status(400).json({ success: false, message: 'Pond selection is required' });
    }

    // Verify pond belongs to user
    const pond = await Pond.findById(pondId);
    if (!pond) {
      return res.status(404).json({ success: false, message: 'Pond not found' });
    }
    if (req.user.role !== 'admin' && pond.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this pond' });
    }

    const morning = Number(morningKg) || 0;
    const afternoon = Number(afternoonKg) || 0;
    const evening = Number(eveningKg) || 0;
    const totalDailyKg = Number((morning + afternoon + evening).toFixed(2));

    const feedDate = date ? new Date(date) : new Date();
    // Normalize to date start
    feedDate.setHours(0, 0, 0, 0);

    // Upsert or create
    let record = await FeedRecord.findOne({
      pond: pondId,
      date: {
        $gte: feedDate,
        $lt: new Date(feedDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (record) {
      record.morningKg = morning;
      record.afternoonKg = afternoon;
      record.eveningKg = evening;
      record.totalDailyKg = totalDailyKg;
      if (feedType) record.feedType = feedType;
      if (notes !== undefined) record.notes = notes;
      await record.save();
    } else {
      record = await FeedRecord.create({
        pond: pondId,
        farmer: pond.farmer,
        date: feedDate,
        morningKg: morning,
        afternoonKg: afternoon,
        eveningKg: evening,
        totalDailyKg,
        feedType: feedType || 'Pellet Feed (38% Protein)',
        notes
      });
    }

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    console.error('Log feed error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get feed records for farmer / pond
// @route   GET /api/feed
export const getFeedRecords = async (req, res) => {
  try {
    const { pondId, startDate, endDate } = req.query;
    let query = {};

    if (req.user.role !== 'admin') {
      query.farmer = req.user._id;
    }

    if (pondId) {
      query.pond = pondId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const records = await FeedRecord.find(query)
      .populate('pond', 'name pondNumber')
      .sort({ date: -1 })
      .limit(100);

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Calculate feed consumption totals (daily, weekly, monthly, pond total)
// @route   GET /api/feed/analytics
export const getFeedAnalytics = async (req, res) => {
  try {
    const { pondId } = req.query;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let baseMatch = {};
    if (req.user.role !== 'admin') {
      baseMatch.farmer = req.user._id;
    }
    if (pondId) {
      baseMatch.pond = pondId;
    }

    // 1. Today's Feed
    const todayRecords = await FeedRecord.find({
      ...baseMatch,
      date: { $gte: todayStart }
    });
    const todayTotal = todayRecords.reduce((acc, r) => acc + (r.totalDailyKg || 0), 0);

    // 2. Weekly Feed (last 7 days)
    const weeklyRecords = await FeedRecord.find({
      ...baseMatch,
      date: { $gte: sevenDaysAgo }
    });
    const weeklyTotal = weeklyRecords.reduce((acc, r) => acc + (r.totalDailyKg || 0), 0);

    // 3. Monthly Feed (last 30 days)
    const monthlyRecords = await FeedRecord.find({
      ...baseMatch,
      date: { $gte: thirtyDaysAgo }
    });
    const monthlyTotal = monthlyRecords.reduce((acc, r) => acc + (r.totalDailyKg || 0), 0);

    // 4. Total cumulative consumption per pond
    const pondTotals = await FeedRecord.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: '$pond',
          totalKg: { $sum: '$totalDailyKg' },
          recordCount: { $sum: 1 },
          lastLoggedDate: { $max: '$date' }
        }
      },
      {
        $lookup: {
          from: 'ponds',
          localField: '_id',
          foreignField: '_id',
          as: 'pond'
        }
      },
      { $unwind: '$pond' },
      {
        $project: {
          pondId: '$_id',
          pondName: '$pond.name',
          pondNumber: '$pond.pondNumber',
          totalKg: { $round: ['$totalKg', 2] },
          recordCount: 1,
          lastLoggedDate: 1
        }
      }
    ]);

    // 5. Daily feed history for charts (last 14 days)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const chartRecords = await FeedRecord.find({
      ...baseMatch,
      date: { $gte: fourteenDaysAgo }
    })
      .populate('pond', 'name pondNumber')
      .sort({ date: 1 });

    // Format chart records grouped by day
    const chartMap = {};
    chartRecords.forEach((r) => {
      const dayKey = new Date(r.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      if (!chartMap[dayKey]) {
        chartMap[dayKey] = {
          date: dayKey,
          morningKg: 0,
          afternoonKg: 0,
          eveningKg: 0,
          totalKg: 0
        };
      }
      chartMap[dayKey].morningKg += r.morningKg || 0;
      chartMap[dayKey].afternoonKg += r.afternoonKg || 0;
      chartMap[dayKey].eveningKg += r.eveningKg || 0;
      chartMap[dayKey].totalKg += r.totalDailyKg || 0;
    });

    const feedChartData = Object.values(chartMap).map((d) => ({
      ...d,
      morningKg: Number(d.morningKg.toFixed(1)),
      afternoonKg: Number(d.afternoonKg.toFixed(1)),
      eveningKg: Number(d.eveningKg.toFixed(1)),
      totalKg: Number(d.totalKg.toFixed(1))
    }));

    res.json({
      success: true,
      data: {
        todayTotal: Number(todayTotal.toFixed(2)),
        weeklyTotal: Number(weeklyTotal.toFixed(2)),
        monthlyTotal: Number(monthlyTotal.toFixed(2)),
        pondTotals,
        feedChartData
      }
    });
  } catch (error) {
    console.error('Feed analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete feed record
// @route   DELETE /api/feed/:id
export const deleteFeedRecord = async (req, res) => {
  try {
    const record = await FeedRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Feed record not found' });
    }
    if (req.user.role !== 'admin' && record.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await record.deleteOne();
    res.json({ success: true, message: 'Feed record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
