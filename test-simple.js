// Simple test for postal code mapping
console.log('🧪 Testing postal code mapping...\n');

// Test function (copied from electricity.ts)
function inferZoneFromPostalCode(postalCode) {
  const code = postalCode.replace(/\s+/g, '');
  if (!/^\d{4,5}$/.test(code)) return undefined;

  const fullCode = parseInt(code, 10);
  
  if (fullCode >= 0 && fullCode <= 1999) return 'NO1';
  if (fullCode >= 2000 && fullCode <= 2999) return 'NO2';
  
  if (fullCode >= 3000 && fullCode <= 3999) {
    if (fullCode >= 3100 && fullCode <= 3399) return 'NO2';
    if (fullCode >= 3500 && fullCode <= 3599) return 'NO1';
    return 'NO5';
  }
  
  if (fullCode >= 4000 && fullCode <= 4999) {
    if (fullCode >= 4000 && fullCode <= 4299) return 'NO2';
    return 'NO5';
  }
  
  if (fullCode >= 5000 && fullCode <= 6999) {
    if (fullCode >= 6000 && fullCode <= 6999) return 'NO5';
    return 'NO3';
  }
  
  if (fullCode >= 7000 && fullCode <= 9999) return 'NO4';
  
  return undefined;
}

// Test cases
const tests = [
  ['0150', 'NO1', 'Oslo'],
  ['3114', 'NO2', 'Tønsberg'],
  ['3512', 'NO1', 'Hønefoss'],
  ['4000', 'NO2', 'Stavanger'],
  ['5000', 'NO3', 'Trondheim'],
  ['6000', 'NO5', 'Ålesund'],
  ['7000', 'NO4', 'Trondheim'],
  ['9000', 'NO4', 'Tromsø']
];

console.log('Testing known cities:');
tests.forEach(([code, expected, city]) => {
  const result = inferZoneFromPostalCode(code);
  const status = result === expected ? '✅' : '❌';
  console.log(`${status} ${code} (${city}) → ${result} (expected: ${expected})`);
});

console.log('\nTest completed!');
