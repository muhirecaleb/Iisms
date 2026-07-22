// generate-hash.js
const bcrypt = require('bcrypt'); // or require('bcryptjs')

async function run() {
  const password = 'password123';
  const saltRounds = 10;
  
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Your Hash:', hash);
}

run();