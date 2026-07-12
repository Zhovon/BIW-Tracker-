const { execSync } = require('child_process');
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

async function importCommits(repoPath, repoName) {
  try {
    console.log(`Extracting commits from ${repoPath}...`);
    const stdout = execSync('git log -n 50 --pretty=format:"%H|%ad|%s" --date=iso', { cwd: repoPath, encoding: 'utf8' });
    const lines = stdout.split('\n').filter(Boolean);
    
    let count = 0;
    for (const line of lines) {
      const [hash, dateStr, ...msgParts] = line.split('|');
      const msg = msgParts.join('|');
      
      const { data, error } = await supabase.from('tasks').insert({
        title: `[${repoName}] ${msg}`,
        description: `Git Commit: ${hash}`,
        assignee: 'Shahadat',
        status: 'completed',
        priority: 'medium',
        category: 'Engineering',
        due_time: new Date(dateStr).toISOString(),
      });
      
      if (error) {
        console.error('Error inserting commit:', error);
      } else {
        count++;
      }
    }
    console.log(`Successfully imported ${count} commits from ${repoName}`);
  } catch (err) {
    console.error(`Failed to process repo ${repoPath}:`, err.message);
  }
}

async function run() {
  await importCommits('/Users/biw/Documents/Tickting System ', 'Ticketing System');
  await importCommits('/Users/biw/Documents/Alternative/unified-messaging/frontend', 'Unified Messaging Protocol');
  console.log("Done.");
}

run();
