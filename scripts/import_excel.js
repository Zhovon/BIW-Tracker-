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
  const str = excelStatus.toString().toLowerCase();
  if (str.includes('complet') || str.includes('approv')) return 'completed';
  if (str.includes('progress') || str.includes('edit')) return 'in_progress';
  if (str.includes('review') || str.includes('wait')) return 'under_review';
  return 'pending';
}

async function run() {
  let count = 0;
  for (let i = 4; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[1] || !row[3]) continue; // Skip empty rows

    const dateStr = row[1]; // '08 Jun 2026'
    const taskName = row[3];
    const category = row[4] || 'General';
    const excelStatus = row[5] || 'Pending';
    const approvedBy = row[6] || '';
    const notes = row[7] || '';
    
    let description = '';
    if (notes) description += `Notes: ${notes}\n`;
    if (approvedBy && approvedBy !== '-') description += `Approved By: ${approvedBy}`;

    const parsedDate = new Date(dateStr);
    
    const taskData = {
      title: taskName,
      description: description.trim() || null,
      assignee: 'Shifat',
      status: mapStatus(excelStatus),
      priority: 'medium',
      category: category.substring(0, 50), // prevent too long categories
      due_time: parsedDate.toISOString()
    };

    const { error } = await supabase.from('tasks').insert(taskData);
    if (error) {
      console.error(`Failed on row ${i}:`, error.message);
    } else {
      count++;
    }
  }
  console.log(`Successfully imported ${count} tasks for Shifat from Excel.`);
}

run();
