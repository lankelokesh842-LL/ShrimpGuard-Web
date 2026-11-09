import Harvest from '../models/Harvest.js';
import Pond from '../models/Pond.js';

// @desc    Record pond harvest
// @route   POST /api/harvests
export const recordHarvest = async (req, res) => {
  try {
    const {
      pondId,
      harvestDate,
      totalWeightKg,
      countPerKg,
      pricePerKg,
      survivalRatePercent,
      notes
    } = req.body;

    if (!pondId || !totalWeightKg || !countPerKg || !pricePerKg) {
      return res.status(400).json({
        success: false,
        message: 'Pond ID, harvest weight, count/kg, and price/kg are required'
      });
    }

    const pond = await Pond.findById(pondId);
    if (!pond) {
      return res.status(404).json({ success: false, message: 'Pond not found' });
    }

    if (req.user.role !== 'admin' && pond.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this pond' });
    }

    const weight = Number(totalWeightKg);
    const count = Number(countPerKg);
    const price = Number(pricePerKg);
    const revenue = Number((weight * price).toFixed(2));

    // Calculate survival rate if not provided:
    // estimated harvested shrimp count = weight * countPerKg
    // survival rate = (harvested count / pond.shrimpCount) * 100
    let calculatedSurvival = survivalRatePercent ? Number(survivalRatePercent) : null;
    if (calculatedSurvival === null && pond.shrimpCount > 0) {
      const estimatedHarvestedShrimp = weight * count;
      calculatedSurvival = Number(Math.min(100, (estimatedHarvestedShrimp / pond.shrimpCount) * 100).toFixed(1));
    }

    const harvest = await Harvest.create({
      farmer: req.user._id,
      pond: pondId,
      harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
      totalWeightKg: weight,
      countPerKg: count,
      pricePerKg: price,
      totalRevenue: revenue,
      survivalRatePercent: calculatedSurvival,
      notes
    });

    const populated = await Harvest.findById(harvest._id).populate('pond', 'name pondNumber species');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get harvest records
// @route   GET /api/harvests
export const getHarvests = async (req, res) => {
  try {
    const { pondId } = req.query;
    let query = {};

    if (req.user.role !== 'admin') {
      query.farmer = req.user._id;
    }

    if (pondId) query.pond = pondId;

    const harvests = await Harvest.find(query)
      .populate('pond', 'name pondNumber species sizeHectares')
      .populate('farmer', 'name farmLocation')
      .sort({ harvestDate: -1 });

    const totalWeight = harvests.reduce((acc, h) => acc + h.totalWeightKg, 0);
    const totalRevenue = harvests.reduce((acc, h) => acc + h.totalRevenue, 0);
    const avgSurvival = harvests.length
      ? Number((harvests.reduce((acc, h) => acc + (h.survivalRatePercent || 0), 0) / harvests.length).toFixed(1))
      : 0;

    res.json({
      success: true,
      count: harvests.length,
      metrics: {
        totalWeightKg: Number(totalWeight.toFixed(2)),
        totalRevenue: Number(totalRevenue.toFixed(2)),
        averageSurvivalRate: avgSurvival
      },
      data: harvests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete harvest
// @route   DELETE /api/harvests/:id
export const deleteHarvest = async (req, res) => {
  try {
    const harvest = await Harvest.findById(req.params.id);
    if (!harvest) {
      return res.status(404).json({ success: false, message: 'Harvest not found' });
    }
    if (req.user.role !== 'admin' && harvest.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await harvest.deleteOne();
    res.json({ success: true, message: 'Harvest record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
