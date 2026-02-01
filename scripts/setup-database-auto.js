const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('\n========================================');
  console.log('AUTOMATED DATABASE SETUP');
  console.log('========================================\n');

  try {
    // Check if tables already exist
    const { data: existingClients, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('SUCCESS: Database is already set up!');
      console.log('Tables exist and are accessible.\n');
      return;
    }

    // Tables don't exist - user needs to run SQL manually
    if (checkError.code === '42P01' || checkError.message.includes('does not exist')) {
      console.log('Tables not found. Setting up database...\n');
      console.log('IMPORTANT: You must run the SQL script manually ONE TIME:');
      console.log('');
      console.log('1. Go to: ' + supabaseUrl + '/sql');
      console.log('2. Copy the SQL from: supabase-schema-only.sql');
      console.log('3. Paste and click RUN');
      console.log('');
      console.log('After that, the app will work automatically!\n');
      process.exit(1);
    }

    console.log('SUCCESS: Database is ready!\n');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();
