import User from '../models/User.js';
import Pond from '../models/Pond.js';
import FeedRecord from '../models/FeedRecord.js';
import WaterQualityRecord from '../models/WaterQualityRecord.js';
import Alert from '../models/Alert.js';
import Expense from '../models/Expense.js';
import Harvest from '../models/Harvest.js';
import { evaluateWaterQuality } from './healthEvaluator.js';

export async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already populated. Skipping automatic seeding.');
      return;
    }

    console.log('🌱 Seeding initial demo data for ShrimpGuard...');

    // 1. Create Admin Account
    const admin = await User.create({
      name: 'ShrimpGuard Administrator',
      email: 'admin@shrimpguard.com',
      password: 'admin123',
      mobile: '+91 98480 12345',
      farmLocation: 'Central Aquaculture Control Hub, Nellore, AP',
      role: 'admin',
      status: 'active'
    });

    // 2. Create Farmer Account
    const farmer = await User.create({
      name: 'Ramesh Reddy',
      email: 'farmer@shrimpguard.com',
      password: 'farmer123',
      mobile: '+91 94401 67890',
      farmLocation: 'Bhimavaram Delta, West Godavari, Andhra Pradesh',
      role: 'farmer',
      status: 'active'
    });

    console.log('✅ Created Demo Users (Admin & Farmer)');

    // 3. Create 3 Sample Ponds for Ramesh Reddy
    const now = new Date();
    const fortyFiveDaysAgo = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const seventyFiveDaysAgo = new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000);

    const pond1 = await Pond.create({
      farmer: farmer._id,
      name: 'Pond 01 - North Bay',
      pondNumber: 'P-01',
      sizeHectares: 1.2,
      stockingDate: fortyFiveDaysAgo,
      shrimpCount: 180000,
      species: 'Pacific White Shrimp (Litopenaeus vannamei)',
      initialFeedDetails: {
        feedBrand: 'CP Aqua Blanca #2',
        pelletSize: '0.8mm Pellet',
        initialQuantityKg: 15
      },
      status: 'normal',
      currentHealthScore: 96,
      lastReading: {
        temperature: 28.5,
        pH: 8.05,
        dissolvedOxygen: 6.4,
        turbidity: 34.0,
        timestamp: new Date(now.getTime() - 15 * 60 * 1000),
        status: 'normal'
      }
    });

    const pond2 = await Pond.create({
      farmer: farmer._id,
      name: 'Pond 02 - East Delta',
      pondNumber: 'P-02',
      sizeHectares: 1.0,
      stockingDate: sixtyDaysAgo,
      shrimpCount: 150000,
      species: 'Pacific White Shrimp (Litopenaeus vannamei)',
      initialFeedDetails: {
        feedBrand: 'Grobest Grower #3',
        pelletSize: '1.2mm Pellet',
        initialQuantityKg: 20
      },
      status: 'warning',
      currentHealthScore: 76,
      lastReading: {
        temperature: 32.8,
        pH: 8.65,
        dissolvedOxygen: 4.2,
        turbidity: 49.0,
        timestamp: new Date(now.getTime() - 30 * 60 * 1000),
        status: 'warning'
      }
    });

    const pond3 = await Pond.create({
      farmer: farmer._id,
      name: 'Pond 03 - South Creek',
      pondNumber: 'P-03',
      sizeHectares: 1.5,
      stockingDate: seventyFiveDaysAgo,
      shrimpCount: 120000,
      species: 'Black Tiger Shrimp (Penaeus monodon)',
      initialFeedDetails: {
        feedBrand: 'Avanti Feeds Supreme',
        pelletSize: '1.6mm Finisher',
        initialQuantityKg: 25
      },
      status: 'critical',
      currentHealthScore: 44,
      lastReading: {
        temperature: 34.6,
        pH: 9.25,
        dissolvedOxygen: 2.8,
        turbidity: 66.0,
        timestamp: new Date(now.getTime() - 10 * 60 * 1000),
        status: 'critical'
      }
    });

    console.log('✅ Created 3 Ponds for Farmer Ramesh');

    // 4. Seed Historical Water Quality Readings for charts
    const pondsList = [
      { pond: pond1, status: 'normal', tempBase: 28.2, phBase: 8.0, doBase: 6.2, turbBase: 33 },
      { pond: pond2, status: 'warning', tempBase: 32.0, phBase: 8.6, doBase: 4.3, turbBase: 48 },
      { pond: pond3, status: 'critical', tempBase: 34.2, phBase: 9.2, doBase: 2.9, turbBase: 65 }
    ];

    for (const item of pondsList) {
      for (let i = 12; i >= 0; i--) {
        const timeOffset = new Date(now.getTime() - i * 2 * 60 * 60 * 1000);
        // Slight fluctuation
        const jitter = (Math.random() - 0.5) * 0.4;
        const temp = Number((item.tempBase + jitter).toFixed(1));
        const ph = Number((item.phBase + jitter * 0.2).toFixed(2));
        const doVal = Number(Math.max(1.8, item.doBase + jitter * 0.5).toFixed(2));
        const turb = Number((item.turbBase + jitter * 3).toFixed(1));

        const evalResult = evaluateWaterQuality({
          temperature: temp,
          pH: ph,
          dissolvedOxygen: doVal,
          turbidity: turb
        });

        await WaterQualityRecord.create({
          pond: item.pond._id,
          farmer: farmer._id,
          timestamp: timeOffset,
          temperature: temp,
          pH: ph,
          dissolvedOxygen: doVal,
          turbidity: turb,
          isSimulated: true,
          scenario: item.status,
          healthScore: evalResult.healthScore,
          status: evalResult.status,
          violations: evalResult.violations,
          recommendedAction: evalResult.recommendedAction,
          notes: `Simulated Telemetry Record (${item.status.toUpperCase()} profile)`
        });
      }
    }

    console.log('✅ Seeded Telemetry History for Charts');

    // 5. Seed Alerts for Warning and Critical ponds
    await Alert.create({
      pond: pond2._id,
      farmer: farmer._id,
      severity: 'warning',
      title: 'Pond Condition Warning: Pond 02 - East Delta (P-02)',
      message: 'WARNING: Dissolved Oxygen (4.2 mg/L) is suboptimal. | WARNING: pH (8.65) is drifting above optimal target.',
      parameter: 'Dissolved Oxygen & pH',
      value: 4.2,
      threshold: '>= 5.0 mg/L',
      recommendedAction: 'Engage secondary aerators during nighttime. Reduce feed quantity by 20% until DO stabilizes above 5.0 mg/L.',
      isRead: false,
      timestamp: new Date(now.getTime() - 45 * 60 * 1000)
    });

    await Alert.create({
      pond: pond3._id,
      farmer: farmer._id,
      severity: 'critical',
      title: 'CRITICAL RISK ALERT: Pond 03 - South Creek (P-03)',
      message: 'CRITICAL: Dissolved Oxygen (2.8 mg/L) is dangerously low! Severe risk of hypoxia. | CRITICAL: pH (9.25) is excessively alkaline! High toxicity risk from unionized ammonia.',
      parameter: 'Dissolved Oxygen',
      value: 2.8,
      threshold: '>= 5.0 mg/L',
      recommendedAction: 'Turn on ALL auxiliary paddlewheel aerators immediately. Cut or suspend feed application. Exchange 10-15% surface water to buffer high alkalinity.',
      isRead: false,
      timestamp: new Date(now.getTime() - 15 * 60 * 1000)
    });

    console.log('✅ Seeded Active Demonstration Alerts');

    // 6. Seed Daily Feed Records for the past 7 days for all 3 ponds
    for (let day = 7; day >= 0; day--) {
      const feedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);

      // Pond 1 feed
      await FeedRecord.create({
        pond: pond1._id,
        farmer: farmer._id,
        date: feedDate,
        morningKg: 18.5,
        afternoonKg: 14.0,
        eveningKg: 16.5,
        totalDailyKg: 49.0,
        feedType: 'CP Aqua Blanca 38% Protein',
        notes: 'Good feeding response on check trays.'
      });

      // Pond 2 feed (slightly curtailed due to warning)
      await FeedRecord.create({
        pond: pond2._id,
        farmer: farmer._id,
        date: feedDate,
        morningKg: 15.0,
        afternoonKg: 10.0,
        eveningKg: 12.0,
        totalDailyKg: 37.0,
        feedType: 'Grobest Grower #3',
        notes: 'Reduced afternoon feeding due to high solar water temp.'
      });

      // Pond 3 feed (suspended or reduced due to critical DO)
      await FeedRecord.create({
        pond: pond3._id,
        farmer: farmer._id,
        date: feedDate,
        morningKg: day === 0 ? 0 : 12.0,
        afternoonKg: day === 0 ? 0 : 8.0,
        eveningKg: day === 0 ? 4.0 : 10.0,
        totalDailyKg: day === 0 ? 4.0 : 30.0,
        feedType: 'Avanti Supreme 40%',
        notes: day === 0 ? 'EMERGENCY: Feed paused due to low DO alert.' : 'Normal ration.'
      });
    }

    console.log('✅ Seeded 7-Day Feed Consumption Records');

    // 7. Seed Sample Expenses
    await Expense.create({
      farmer: farmer._id,
      pond: pond1._id,
      category: 'Feed',
      amount: 45000,
      date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      description: 'Purchased 20 bags of CP Aqua starter feed'
    });

    await Expense.create({
      farmer: farmer._id,
      pond: pond2._id,
      category: 'Electricity/Fuel',
      amount: 18500,
      date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      description: 'Monthly electricity bill for 8 paddlewheel aerators'
    });

    await Expense.create({
      farmer: farmer._id,
      pond: pond3._id,
      category: 'Chemicals/Probiotics',
      amount: 12000,
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      description: 'Agricultural dolomite lime & biofloc probiotic bacteria culture'
    });

    // 8. Seed a completed Harvest Record
    await Harvest.create({
      farmer: farmer._id,
      pond: pond1._id,
      harvestDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      totalWeightKg: 3250,
      countPerKg: 35,
      pricePerKg: 385,
      totalRevenue: 1251250,
      survivalRatePercent: 82.5,
      notes: 'Summer cycle complete harvest. Grade-A export quality.'
    });

    console.log('✅ Seeded Expenses and Harvest History');
    console.log('🎉 Database seeding complete!');
  } catch (error) {
    console.error('Database seeding error:', error);
  }
}
