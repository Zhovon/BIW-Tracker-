const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envPath = '/Users/biw/Documents/jurnal/.env.local';
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  if (line && line.includes('=')) {
    const [key, ...rest] = line.split('=');
    envVars[key.trim()] = rest.join('=').trim().replace(/['"]/g, '');
  }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

const workbook = xlsx.readFile('/Users/biw/Documents/jurnal/BIW_Bashundhara_Task_Tracker-1.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

function mapStatus(excelStatus) {
  if (!excelStatus) return 'pending';
  const str = excelStatus.toString().toLowerCase().trim();
  
  if (str === 'completed' || str === 'approved') return 'completed';
  if (str === 'in progress' || str.includes('revision requested') || str.includes('revision needed') || str.includes('revision in progress')) return 'in_progress';
  if (str.includes('review') || str === 'sent' || str === 'submitted' || str === 'pending feedback' || str === 'recheck requested') return 'under_review';
  
  return 'pending';
}

async function run() {
  let count = 0;
  for (let i = 4; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[1] || !row[3]) continue;

    const taskName = row[3];
    const excelStatus = row[5] || 'Pending';
    const correctStatus = mapStatus(excelStatus);
    
    // Update the task in supabase where title matches
    const { data: updated, error } = await supabase
      .from('tasks')
      .update({ status: correctStatus })
      .eq('title', taskName)
      .eq('assignee', 'Shifat');
      
    if (error) {
      console.error(`Failed to update ${taskName}:`, error.message);
    } else {
      count++;
    }
  }
  console.log(`Successfully updated statuses for ${count} tasks.`);
}

run();
