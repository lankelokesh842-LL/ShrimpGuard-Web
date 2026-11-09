import WaterQualityRecord from '../models/WaterQualityRecord.js';
import Pond from '../models/Pond.js';
import Alert from '../models/Alert.js';
import { evaluateWaterQuality } from '../utils/healthEvaluator.js';
import { generateSensorReading } from '../utils/simulator.js';

// Helper to handle alert generation and pond status update
async function processWaterReading({ pond, farmerId, readingData, isSimulated, scenario, notes }) {
  // 1. Evaluate with rule-based engine
  const evaluation = evaluateWaterQuality(readingData);

  // 2. Save water quality record
  const record = await WaterQualityRecord.create({
    pond: pond._id,
    farmer: farmerId,
    temperature: readingData.temperature,
    pH: readingData.pH,
    dissolvedOxygen: readingData.dissolvedOxygen,
    turbidity: readingData.turbidity,
    isSimulated: !!isSimulated,
    scenario: scenario || (isSimulated ? 'normal' : 'manual'),
    healthScore: evaluation.healthScore,
    status: evaluation.status,
    violations: evaluation.violations,
    recommendedAction: evaluation.recommendedAction,
    notes: notes || (isSimulated ? `[SIMULATION ENGINE - ${scenario?.toUpperCase() || 'NORMAL'} PRESET]` : '')
  });

  // 3. Update pond status and latest reading snapshot
  pond.status = evaluation.status;
  pond.currentHealthScore = evaluation.healthScore;
  pond.lastReading = {
    temperature: readingData.temperature,
    pH: readingData.pH,
    dissolvedOxygen: readingData.dissolvedOxygen,
    turbidity: readingData.turbidity,
    timestamp: record.timestamp,
    status: evaluation.status
  };
  await pond.save();

  // 4. Generate alert if pond entered WARNING or CRITICAL state
  let createdAlert = null;
  if (evaluation.status === 'warning' || evaluation.status === 'critical') {
    const alertTitle = evaluation.status === 'critical'
      ? `CRITICAL RISK ALERT: ${pond.name} (${pond.pondNumber})`
      : `Pond Condition Warning: ${pond.name} (${pond.pondNumber})`;

    const primaryViolation = evaluation.violations[0];
    const alertMessage = evaluation.violations.map((v) => v.message).join(' | ');

    createdAlert = await Alert.create({
      pond: pond._id,
      farmer: farmerId,
      severity: evaluation.status,
      title: alertTitle,
      message: alertMessage,
      parameter: primaryViolation ? primaryViolation.parameter : 'Multi-parameter',
      value: primaryViolation ? primaryViolation.value : 0,
      threshold: primaryViolation ? primaryViolation.expected : '',
      recommendedAction: evaluation.recommendedAction,
      isRead: false,
      timestamp: new Date(),
      channels: {
        inApp: true,
        emailQueued: false, // Architectural flag ready for future SMTP webhook
        smsQueued: false    // Architectural flag ready for future SMS gateway
      }
    });
  }

  return { record, evaluation, createdAlert };
}

// @desc    Enter manual water quality readings
// @route   POST /api/water-quality/manual
export const recordManualReading = async (req, res) => {
  try {
    const { pondId, temperature, pH, dissolvedOxygen, turbidity, notes } = req.body;

    if (!pondId || temperature === undefined || pH === undefined || dissolvedOxygen === undefined || turbidity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Pond ID, temperature, pH, dissolved oxygen, and turbidity are required'
      });
    }

    const pond = await Pond.findById(pondId);
    if (!pond) {
      return res.status(404).json({ success: false, message: 'Pond not found' });
    }

    if (req.user.role !== 'admin' && pond.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this pond' });
    }

    const readingData = {
      temperature: Number(temperature),
      pH: Number(pH),
      dissolvedOxygen: Number(dissolvedOxygen),
      turbidity: Number(turbidity)
    };

    const { record, evaluation, createdAlert } = await processWaterReading({
      pond,
      farmerId: pond.farmer,
      readingData,
      isSimulated: false,
      scenario: 'manual',
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Manual water quality reading logged successfully',
      data: {
        record,
        evaluation,
        createdAlert
      }
    });
  } catch (error) {
    console.error('Manual water reading error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate simulated sensor reading (Normal, Warning, Critical presets)
// @route   POST /api/water-quality/simulate
export const recordSimulatedReading = async (req, res) => {
  try {
    const { pondId, scenario = 'normal' } = req.body;

    if (!pondId) {
      return res.status(400).json({ success: false, message: 'Pond selection is required' });
    }

    const pond = await Pond.findById(pondId);
    if (!pond) {
      return res.status(404).json({ success: false, message: 'Pond not found' });
    }

    if (req.user.role !== 'admin' && pond.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this pond' });
    }

    // Generate simulated sensor reading based on scenario preset
    const simData = generateSensorReading(scenario);

    const { record, evaluation, createdAlert } = await processWaterReading({
      pond,
      farmerId: pond.farmer,
      readingData: {
        temperature: simData.temperature,
        pH: simData.pH,
        dissolvedOxygen: simData.dissolvedOxygen,
        turbidity: simData.turbidity
      },
      isSimulated: true,
      scenario: simData.scenario,
      notes: `Generated via Hardware-Free Simulation Engine [${scenario.toUpperCase()} Mode]`
    });

    res.status(201).json({
      success: true,
      message: `Simulated ${scenario.toUpperCase()} sensor telemetry recorded successfully`,
      data: {
        record,
        evaluation,
        createdAlert
      }
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get water quality history for a pond (for charts & logs)
// @route   GET /api/water-quality/history/:pondId
export const getWaterQualityHistory = async (req, res) => {
  try {
    const { pondId } = req.params;
    const limit = parseInt(req.query.limit) || 30;

    const pond = await Pond.findById(pondId);
    if (!pond) {
      return res.status(404).json({ success: false, message: 'Pond not found' });
    }

    if (req.user.role !== 'admin' && pond.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const readings = await WaterQualityRecord.find({ pond: pondId })
      .sort({ timestamp: 1 })
      .limit(limit);

    // Format for Recharts
    const chartData = readings.map((r) => ({
      id: r._id,
      timestamp: r.timestamp,
      formattedTime: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      formattedDate: new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      temperature: r.temperature,
      pH: r.pH,
      dissolvedOxygen: r.dissolvedOxygen,
      turbidity: r.turbidity,
      healthScore: r.healthScore,
      status: r.status,
      isSimulated: r.isSimulated,
      scenario: r.scenario,
      recommendedAction: r.recommendedAction
    }));

    res.json({
      success: true,
      count: readings.length,
      data: {
        pond,
        readings: chartData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
