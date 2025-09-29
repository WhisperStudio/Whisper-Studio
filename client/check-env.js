const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
console.log('Reading .env file from:', envPath);

try {
  const content = fs.readFileSync(envPath, 'utf8');
  console.log('Env file content:');
  console.log(content);
} catch (error) {
  console.error('Error reading .env file:', error.message);
}
