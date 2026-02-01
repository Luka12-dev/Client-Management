const https = require('https');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('\nERROR: Missing Supabase credentials in .env.local\n');
  process.exit(1);
}

console.log('\n========================================');
console.log('AUTOMATED SUPABASE DATABASE SETUP');
console.log('========================================\n');

// Read SQL file
const sqlPath = path.join(__dirname, '..', 'supabase-setup.sql');
const sqlScript = fs.readFileSync(sqlPath, 'utf8');

// Parse the project ref from URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

console.log('Project:', projectRef);
console.log('Executing SQL script...\n');

// Use Supabase Management API to execute SQL
const url = `https://${projectRef}.supabase.co/rest/v1/rpc`;
const postData = JSON.stringify({
  query: sqlScript
});

const options = {
  hostname: `${projectRef}.supabase.co`,
  port: 443,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length,
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Prefer': 'return=minimal'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('SUCCESS: Database tables created!\n');
      console.log('========================================');
      console.log('Setup complete! Run: npm run dev');
      console.log('========================================\n');
    } else {
      console.log('Could not execute SQL automatically.');
      console.log('Status Code:', res.statusCode);
      console.log('\nPlease run SQL manually:');
      console.log('1. Go to:', supabaseUrl);
      console.log('2. SQL Editor > New Query');
      console.log('3. Copy from: supabase-setup.sql');
      console.log('4. Run the query\n');
    }
  });
});

req.on('error', (error) => {
  console.log('Automatic setup not available.');
  console.log('\nMANUAL SETUP REQUIRED:');
  console.log('1. Go to:', supabaseUrl);
  console.log('2. Click: SQL Editor (left sidebar)');
  console.log('3. Click: New Query');
  console.log('4. Copy ALL from: supabase-setup.sql');
  console.log('5. Paste and click: RUN\n');
  console.log('Then run: npm run dev\n');
});

req.write(postData);
req.end();
