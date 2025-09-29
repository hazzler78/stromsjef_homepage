// Test script for Norwegian postal code to electricity zone mapping
// This script tests known Norwegian cities and their expected zones

const { inferZoneFromPostalCode } = require('./src/lib/electricity.ts');

// Test cases: [postalCode, expectedZone, cityName, fylke]
const testCases = [
  // NO1: Øst-Norge
  ['0150', 'NO1', 'Oslo', 'Oslo'],
  ['1000', 'NO1', 'Oslo', 'Oslo'],
  ['1500', 'NO1', 'Moss', 'Østfold'],
  ['1900', 'NO1', 'Fetsund', 'Akershus'],
  ['3512', 'NO1', 'Hønefoss', 'Buskerud'],
  
  // NO2: Sør-Norge
  ['2000', 'NO2', 'Kristiansand', 'Agder'],
  ['2500', 'NO2', 'Kristiansand', 'Agder'],
  ['3114', 'NO2', 'Tønsberg', 'Vestfold og Telemark'],
  ['3200', 'NO2', 'Sandefjord', 'Vestfold og Telemark'],
  ['3300', 'NO2', 'Hønefoss', 'Vestfold og Telemark'],
  ['4000', 'NO2', 'Stavanger', 'Rogaland'],
  ['4100', 'NO2', 'Sandnes', 'Rogaland'],
  ['4200', 'NO2', 'Haugesund', 'Rogaland'],
  
  // NO3: Midt-Norge
  ['5000', 'NO3', 'Trondheim', 'Trøndelag'],
  ['5500', 'NO3', 'Trondheim', 'Trøndelag'],
  ['6000', 'NO3', 'Ålesund', 'Møre og Romsdal'],
  ['6500', 'NO3', 'Molde', 'Møre og Romsdal'],
  
  // NO4: Nord-Norge
  ['7000', 'NO4', 'Trondheim', 'Trøndelag'],
  ['8000', 'NO4', 'Bodø', 'Nordland'],
  ['9000', 'NO4', 'Tromsø', 'Troms'],
  ['9500', 'NO4', 'Alta', 'Finnmark'],
  
  // NO5: Vest-Norge
  ['3000', 'NO5', 'Bergen', 'Hordaland'],
  ['4000', 'NO5', 'Bergen', 'Hordaland'],
  ['5000', 'NO5', 'Bergen', 'Hordaland'],
];

// Run tests
function runTests() {
  console.log('🧪 Testing Norwegian postal code to electricity zone mapping\n');
  
  let passed = 0;
  let failed = 0;
  const failures = [];
  
  testCases.forEach(([postalCode, expectedZone, cityName, fylke]) => {
    try {
      const actualZone = inferZoneFromPostalCode(postalCode);
      
      if (actualZone === expectedZone) {
        console.log(`✅ ${postalCode} (${cityName}, ${fylke}) → ${actualZone}`);
        passed++;
      } else {
        console.log(`❌ ${postalCode} (${cityName}, ${fylke}) → Expected: ${expectedZone}, Got: ${actualZone}`);
        failed++;
        failures.push({
          postalCode,
          cityName,
          fylke,
          expected: expectedZone,
          actual: actualZone
        });
      }
    } catch (error) {
      console.log(`💥 ${postalCode} (${cityName}, ${fylke}) → Error: ${error.message}`);
      failed++;
      failures.push({
        postalCode,
        cityName,
        fylke,
        expected: expectedZone,
        actual: 'ERROR',
        error: error.message
      });
    }
  });
  
  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failures.length > 0) {
    console.log(`\n🔍 Failed tests:`);
    failures.forEach(failure => {
      console.log(`  ${failure.postalCode} (${failure.cityName}, ${failure.fylke})`);
      console.log(`    Expected: ${failure.expected}`);
      console.log(`    Got: ${failure.actual}`);
      if (failure.error) {
        console.log(`    Error: ${failure.error}`);
      }
      console.log('');
    });
  }
  
  return { passed, failed, failures };
}

// Additional test for edge cases
function testEdgeCases() {
  console.log('\n🔬 Testing edge cases:\n');
  
  const edgeCases = [
    ['0000', 'NO1', 'Lowest postal code'],
    ['9999', 'NO4', 'Highest postal code'],
    ['1234', 'NO1', 'Random 1xxx'],
    ['2345', 'NO2', 'Random 2xxx'],
    ['3456', 'NO5', 'Random 3xxx'],
    ['4567', 'NO5', 'Random 4xxx'],
    ['5678', 'NO3', 'Random 5xxx'],
    ['6789', 'NO5', 'Random 6xxx'],
    ['7890', 'NO4', 'Random 7xxx'],
    ['8901', 'NO4', 'Random 8xxx'],
    ['9012', 'NO4', 'Random 9xxx'],
  ];
  
  edgeCases.forEach(([postalCode, expectedZone, description]) => {
    const actualZone = inferZoneFromPostalCode(postalCode);
    const status = actualZone === expectedZone ? '✅' : '❌';
    console.log(`${status} ${postalCode} (${description}) → ${actualZone} (expected: ${expectedZone})`);
  });
}

// Main execution
if (require.main === module) {
  console.log('🚀 Starting postal code mapping tests...\n');
  
  const results = runTests();
  testEdgeCases();
  
  console.log('\n🎯 Test completed!');
  
  if (results.failed > 0) {
    console.log(`\n⚠️  ${results.failed} tests failed. Please review the mapping logic.`);
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  }
}

module.exports = { runTests, testEdgeCases };
