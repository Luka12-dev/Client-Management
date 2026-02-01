const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('SUPABASE DATABASE SETUP INSTRUCTIONS');
console.log('========================================\n');

const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('ERROR: .env.local file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const supabaseUrl = urlMatch ? urlMatch[1].trim() : null;

if (!supabaseUrl) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
  process.exit(1);
}

console.log('AUTOMATED SETUP:');
console.log('----------------\n');
console.log('1. Go to your Supabase dashboard:');
console.log('   ' + supabaseUrl + '\n');
console.log('2. Click on "SQL Editor" in the left sidebar\n');
console.log('3. Click "New Query"\n');
console.log('4. Copy ALL contents from: supabase-setup.sql\n');
console.log('5. Paste into SQL Editor and click "RUN"\n');
console.log('========================================');
console.log('After running SQL, start the app with:');
console.log('   npm run dev');
console.log('========================================\n');

// Try to verify connection
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Testing Supabase connection...\n');

supabase
  .from('clients')
  .select('count')
  .then(({ data, error }) => {
    if (error) {
      if (error.code === '42P01') {
        console.log('STATUS: Tables not found - Please run the SQL script as instructed above.\n');
      } else {
        console.log('STATUS: Connected to Supabase, but tables need to be created.\n');
      }
    } else {
      console.log('SUCCESS: Supabase is connected and tables exist!');
      console.log('You can now run: npm run dev\n');
    }
  })
  .catch((err) => {
    console.log('WARNING: Could not verify tables. Please run the SQL script.\n');
  });
