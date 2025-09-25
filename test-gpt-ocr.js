// test-gpt-ocr.js
// Hårdkodar sökvägen till bilden som ska testas

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const imagePath = path.join(__dirname, 'public', 'eon_test.jpg');

async function testGptOcr(imagePath) {
  if (!fs.existsSync(imagePath)) {
    console.error('Filen finns inte:', imagePath);
    process.exit(1);
  }

  const fileName = path.basename(imagePath);
  const fileStream = fs.createReadStream(imagePath);
  const formData = new (require('form-data'))();
  formData.append('file', fileStream, fileName);

  try {
    const res = await fetch('http://localhost:3000/api/gpt-ocr', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });
    const data = await res.json();
    console.log('Svar från /api/gpt-ocr:', data);
  } catch (err) {
    console.error('Fel vid anrop:', err);
  }
}

testGptOcr(imagePath); 