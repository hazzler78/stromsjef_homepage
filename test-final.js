// Final test for Norwegian postal code mapping
console.log('🧪 Final test for postal code mapping...\n');

// Copy the updated function
function inferZoneFromPostalCode(postalCode) {
  const code = postalCode.replace(/\s+/g, '');
  if (!/^\d{4,5}$/.test(code)) return undefined;

  const fullCode = parseInt(code, 10);
  
  // NO1: Øst-Norge (0000-1999 + specific areas)
  if (fullCode >= 0 && fullCode <= 1999) return 'NO1';
  
  // NO2: Sør-Norge (2000-2999 + Rogaland areas)
  if (fullCode >= 2000 && fullCode <= 2999) return 'NO2';
  
  // Special handling for 3xxx range
  if (fullCode >= 3000 && fullCode <= 3999) {
    // Vestfold og Telemark fylke (NO2) - includes Tønsberg (3114)
    if (fullCode >= 3100 && fullCode <= 3199) return 'NO2'; // Vestfold area
    if (fullCode >= 3200 && fullCode <= 3299) return 'NO2'; // Telemark area
    if (fullCode >= 3300 && fullCode <= 3399) return 'NO2'; // Telemark area
    
    // Buskerud fylke (NO1) - specific postal codes
    if (fullCode >= 3500 && fullCode <= 3599) return 'NO1';
    
    // Default to NO5 for other 3xxx areas
    return 'NO5';
  }
  
  // Special handling for 4xxx range  
  if (fullCode >= 4000 && fullCode <= 4999) {
    // Rogaland fylke (NO2) - Stavanger, Sandnes, Haugesund areas
    if (fullCode >= 4000 && fullCode <= 4299) return 'NO2';
    // Default to NO5 for other 4xxx areas
    return 'NO5';
  }
  
  // Special handling for 5xxx-6xxx range
  if (fullCode >= 5000 && fullCode <= 6999) {
    // Hordaland fylke (NO5) - includes Bergen area (5000-5099)
    if (fullCode >= 5000 && fullCode <= 5099) return 'NO5'; // Bergen area
    
    // Møre og Romsdal fylke (NO5) - includes Ålesund, Molde, Kristiansund (6000-6999)
    if (fullCode >= 6000 && fullCode <= 6999) return 'NO5'; // Møre og Romsdal area
    
    // Trøndelag fylke (NO3) - Trondheim area (5100-5999)
    return 'NO3';
  }
  
  // NO4: Nord-Norge (7000-9999)
  if (fullCode >= 7000 && fullCode <= 9999) return 'NO4';
  
  return undefined;
}

// Test all the problematic cases
const criticalTests = [
  // Previously fixed cases
  ['3114', 'NO2', 'Tønsberg'],
  ['3512', 'NO1', 'Hønefoss'],
  ['4000', 'NO2', 'Stavanger'],
  
  // Bergen cases (previously failing)
  ['5000', 'NO5', 'Bergen'],
  ['5010', 'NO5', 'Bergen'],
  
  // Trondheim cases
  ['5100', 'NO3', 'Trondheim'],
  ['5500', 'NO3', 'Trondheim'],
  
  // Møre og Romsdal cases
  ['6000', 'NO5', 'Ålesund'],
  ['6500', 'NO5', 'Molde'],
  
  // Other major cities
  ['0150', 'NO1', 'Oslo'],
  ['7000', 'NO4', 'Trondheim'],
  ['9000', 'NO4', 'Tromsø']
];

console.log('Testing critical cases:');
let passed = 0;
let failed = 0;

criticalTests.forEach(([code, expected, city]) => {
  const result = inferZoneFromPostalCode(code);
  const status = result === expected ? '✅' : '❌';
  console.log(`${status} ${code} (${city}) → ${result} (expected: ${expected})`);
  
  if (result === expected) {
    passed++;
  } else {
    failed++;
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('\n🎉 All critical tests passed! The mapping is working correctly.');
} else {
  console.log('\n⚠️  Some tests still failed. Check the mapping logic.');
}
