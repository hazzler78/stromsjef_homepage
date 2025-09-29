// Simple test for Norwegian postal code to electricity zone mapping
// Run with: node test-zones.js

// Mock the PriceZone enum and function for testing
const PriceZone = {
  NO1: 'NO1',
  NO2: 'NO2', 
  NO3: 'NO3',
  NO4: 'NO4',
  NO5: 'NO5'
};

// Copy the function from electricity.ts
function inferZoneFromPostalCode(postalCode) {
  const code = postalCode.replace(/\s+/g, '');
  if (!/^\d{4,5}$/.test(code)) return undefined;

  const fullCode = parseInt(code, 10);
  
  // NO1: Øst-Norge (0000-1999 + specific areas)
  if (fullCode >= 0 && fullCode <= 1999) return PriceZone.NO1;
  
  // NO2: Sør-Norge (2000-2999 + Rogaland areas)
  if (fullCode >= 2000 && fullCode <= 2999) return PriceZone.NO2;
  
  // Special handling for 3xxx range
  if (fullCode >= 3000 && fullCode <= 3999) {
    // Vestfold og Telemark fylke (NO2) - includes Tønsberg (3114)
    if (fullCode >= 3100 && fullCode <= 3199) return PriceZone.NO2; // Vestfold area
    if (fullCode >= 3200 && fullCode <= 3299) return PriceZone.NO2; // Telemark area
    if (fullCode >= 3300 && fullCode <= 3399) return PriceZone.NO2; // Telemark area
    
    // Buskerud fylke (NO1) - specific postal codes
    if (fullCode >= 3500 && fullCode <= 3599) return PriceZone.NO1;
    
    // Default to NO5 for other 3xxx areas
    return PriceZone.NO5;
  }
  
  // Special handling for 4xxx range  
  if (fullCode >= 4000 && fullCode <= 4999) {
    // Rogaland fylke (NO2) - Stavanger, Sandnes, Haugesund areas
    if (fullCode >= 4000 && fullCode <= 4299) return PriceZone.NO2;
    // Default to NO5 for other 4xxx areas
    return PriceZone.NO5;
  }
  
  // Special handling for 5xxx-6xxx range
  if (fullCode >= 5000 && fullCode <= 6999) {
    // Hordaland fylke (NO5) - includes Bergen area (5000-5099)
    if (fullCode >= 5000 && fullCode <= 5099) return PriceZone.NO5; // Bergen area
    
    // Møre og Romsdal fylke (NO5) - includes Ålesund, Molde, Kristiansund (6000-6999)
    if (fullCode >= 6000 && fullCode <= 6999) return PriceZone.NO5; // Møre og Romsdal area
    
    // Trøndelag fylke (NO3) - Trondheim area (5100-5999)
    return PriceZone.NO3;
  }
  
  // NO4: Nord-Norge (7000-9999)
  if (fullCode >= 7000 && fullCode <= 9999) return PriceZone.NO4;
  
  return undefined;
}

// Test cases with known cities
const testCases = [
  // NO1: Øst-Norge
  ['0150', 'NO1', 'Oslo'],
  ['1000', 'NO1', 'Oslo'],
  ['1500', 'NO1', 'Moss'],
  ['1900', 'NO1', 'Fetsund'],
  ['3512', 'NO1', 'Hønefoss'],
  
  // NO2: Sør-Norge  
  ['2000', 'NO2', 'Kristiansand'],
  ['2500', 'NO2', 'Kristiansand'],
  ['3114', 'NO2', 'Tønsberg'],
  ['3200', 'NO2', 'Sandefjord'],
  ['3300', 'NO2', 'Hønefoss'],
  ['4000', 'NO2', 'Stavanger'],
  ['4100', 'NO2', 'Sandnes'],
  ['4200', 'NO2', 'Haugesund'],
  
  // NO3: Midt-Norge
  ['5100', 'NO3', 'Trondheim'],
  ['5500', 'NO3', 'Trondheim'],
  
  // NO4: Nord-Norge
  ['7000', 'NO4', 'Trondheim'],
  ['8000', 'NO4', 'Bodø'],
  ['9000', 'NO4', 'Tromsø'],
  ['9500', 'NO4', 'Alta'],
  
  // NO5: Vest-Norge
  ['3000', 'NO5', 'Bergen'],
  ['5000', 'NO5', 'Bergen'],
  ['5010', 'NO5', 'Bergen'],
  ['6000', 'NO5', 'Ålesund'],
  ['6500', 'NO5', 'Molde'],
];

// Run tests
console.log('🧪 Testing Norwegian postal code mapping\n');

let passed = 0;
let failed = 0;

testCases.forEach(([postalCode, expectedZone, cityName]) => {
  const actualZone = inferZoneFromPostalCode(postalCode);
  
  if (actualZone === expectedZone) {
    console.log(`✅ ${postalCode} (${cityName}) → ${actualZone}`);
    passed++;
  } else {
    console.log(`❌ ${postalCode} (${cityName}) → Expected: ${expectedZone}, Got: ${actualZone}`);
    failed++;
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.log('\n⚠️  Some tests failed. Check the mapping logic.');
} else {
  console.log('\n🎉 All tests passed!');
}
