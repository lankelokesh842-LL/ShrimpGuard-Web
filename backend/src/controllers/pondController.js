import Pond from '../models/Pond.js';
import WaterQualityRecord from '../models/WaterQualityRecord.js';
import FeedRecord from '../models/FeedRecord.js';
import Alert from '../models/Alert.js';
import Expense from '../models/Expense.js';
import Harvest from '../models/Harvest.js';

// @desc    Create new pond
// @route   POST /api/ponds
export const createPond = async (req, res) => {
  try {
    const {
      name,
      pondNumber,
      sizeHectares,
      stockingDate,
      shrimpCount,
      species,
      initialFeedDetails
    } = req.body;

    if (!name || !pondNumber || !sizeHectares || !stockingDate || !shrimpCount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide pond name, number, size, stocking date, and shrimp count'
      });
    }

    const pond = await Pond.create({
      farmer: req.user._id,
      name,
      pondNumber,
      sizeHectares: Number(sizeHectares),
      stockingDate: new Date(stockingDate),
      shrimpCount: Number(shrimpCount),
      species: species || 'Pacific White Shrimp (Litopenaeus vannamei)',
      initialFeedDetails: initialFeedDetails || {
        feedBrand: 'CP Aqua / Grobest Starter',
        pelletSize: 'Starter Crumble #1',
        initialQuantityKg: 10
      },
      status: 'normal',
      currentHealthScore: 95
    });

    res.status(201).json({ success: true, data: pond });
  } catch (error) {
    console.error('Create pond error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all ponds for logged in farmer (or all for admin)
// @route   GET /api/ponds
export const getPonds = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.farmer = req.user._id;
    } else if (req.query.farmerId) {
      query.farmer = req.query.farmerId;
    }

    const ponds = await Pond.find(query)
      .populate('farmer', 'name email mobile farmLocation')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: ponds.length, data: ponds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single pond by ID
// @route   GET /api/ponds/:id
export const getPondById = async (req, res) => {
  try {
    const pond = await Pond.findById(req.params.id).populate('farmer', 'name email mobile farmLocation');

    if (!pond) {
      return res.status(404).json({ success: false, message: 'Pond not found' });
    }

    // Role verification: only owner farmer or admin
    if (req.user.role !== 'admin' && pond.farmer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this pond' });
    }

    // Fetch latest water readings (last 10)
    const recentWaterQuality = await WaterQualityRecord.find({ pond: pond._id })
      .sort({ timestamp: -1 })
      .limit(10);

    // Fetch recent feed records (last 7 days)
    const recentFeeds = await FeedRecord.find({ pond: pond._id })
      .sort({ date: -1 })
      .limit(7);

    // Fetch active unread alerts for this pond
    const pondAlerts = await Alert.find({ pond: pond._id })
      .sort({ timestamp: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        pond,
        recentWaterQuality,
        recentFeeds,
        pondAlerts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update pond
// @route   PUT /api/ponds/:id
export const updatePond = async (req, res) => {
  try {
    const pond = await Pond.findById(req.params.id);

    if (!pond) {
      return res.status(404).json({ success: false, message: 'Pond not found' });
    }

    if (req.user.role !== 'admin' && pond.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this pond' });
    }

    const {
      name,
      pondNumber,
      sizeHectares,
      stockingDate,
      shrimpCount,
      species,
      initialFeedDetails
    } = req.body;

    if (name) pond.name = name;
    if (pondNumber) pond.pondNumber = pondNumber;
    if (sizeHectares) pond.sizeHectares = Number(sizeHectares);
    if (stockingDate) pond.stockingDate = new Date(stockingDate);
    if (shrimpCount) pond.shrimpCount = Number(shrimpCount);
    if (species) pond.species = species;
    if (initialFeedDetails) pond.initialFeedDetails = initialFeedDetails;

    const updatedPond = await pond.save();
    res.json({ success: true, data: updatedPond });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete pond and associated data
// @route   DELETE /api/ponds/:id
export const deletePond = async (req, res) => {
  try {
    const pond = await Pond.findById(req.params.id);

    if (!pond) {
      return res.status(404).json({ success: false, message: 'Pond not found' });
    }

    if (req.user.role !== 'admin' && pond.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this pond' });
    }

    // Cascade delete associated records
    await WaterQualityRecord.deleteMany({ pond: pond._id });
    await FeedRecord.deleteMany({ pond: pond._id });
    await Alert.deleteMany({ pond: pond._id });
    await Expense.deleteMany({ pond: pond._id });
    await Harvest.deleteMany({ pond: pond._id });
    await pond.deleteOne();

    res.json({ success: true, message: 'Pond and all associated records deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
