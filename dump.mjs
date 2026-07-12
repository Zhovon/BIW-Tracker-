import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function dump() {
  const { data, error } = await supabase.from('tasks').select('*');
  if (error) {
    console.error("Error fetching tasks:", error);
    return;
  }
  
  console.log(`Fetched ${data.length} tasks from Supabase.`);
  fs.writeFileSync('supabase_tasks_dump.json', JSON.stringify(data, null, 2));
  console.log("Tasks dumped to supabase_tasks_dump.json");
}

dump();
