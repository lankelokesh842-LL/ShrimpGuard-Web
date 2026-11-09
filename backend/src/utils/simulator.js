/**
 * Simulator utility for generating realistic aquaculture pond sensor data.
 * Used for hardware-free demonstration and testing.
 */

function getRandomInRange(min, max, decimals = 1) {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

export function generateSensorReading(scenario = 'normal') {
  let reading;

  switch (scenario.toLowerCase()) {
    case 'warning':
      // Suboptimal water condition (e.g., afternoon temperature peak or early dawn DO sag)
      reading = {
        temperature: getRandomInRange(32.2, 33.5, 1),
        pH: getRandomInRange(8.6, 8.9, 2),
        dissolvedOxygen: getRandomInRange(3.8, 4.7, 2),
        turbidity: getRandomInRange(48.0, 56.0, 1)
      };
      break;

    case 'critical':
      // Dangerous hypoxia and extreme alkalinity / ammonia hazard
      reading = {
        temperature: getRandomInRange(34.2, 35.8, 1),
        pH: getRandomInRange(9.2, 9.6, 2),
        dissolvedOxygen: getRandomInRange(2.3, 3.3, 2),
        turbidity: getRandomInRange(64.0, 78.0, 1)
      };
      break;

    case 'normal':
    default:
      // Pristine, optimal tropical pond parameters for Penaeus vannamei
      reading = {
        temperature: getRandomInRange(27.5, 30.2, 1),
        pH: getRandomInRange(7.7, 8.2, 2),
        dissolvedOxygen: getRandomInRange(5.6, 7.2, 2),
        turbidity: getRandomInRange(30.0, 40.0, 1)
      };
      break;
  }

  return {
    ...reading,
    isSimulated: true,
    scenario,
    timestamp: new Date()
  };
}
