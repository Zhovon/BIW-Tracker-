import os
import json
import re
from datetime import datetime

brain_dir = os.path.expanduser("~/.gemini/antigravity-ide/brain")
report = []

for entry in sorted(os.listdir(brain_dir)):
    if entry.startswith('.') or entry == 'tempmediaStorage':
        continue
        
    conv_dir = os.path.join(brain_dir, entry)
    if not os.path.isdir(conv_dir):
        continue
        
    stat = os.stat(conv_dir)
    mod_time = datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d')
        
    task_path = os.path.join(conv_dir, "task.md")
    
    tasks = []
    if os.path.exists(task_path):
        with open(task_path, 'r') as f:
            content = f.read()
            for line in content.split('\n'):
                line = line.strip()
                if re.match(r'^- \[[xX \/]\]', line) or re.match(r'^- `\[[xX \/]\]`', line):
                    tasks.append(line)
    
    goal = ""
    transcript_path = os.path.join(conv_dir, ".system_generated", "logs", "transcript.jsonl")
    if os.path.exists(transcript_path):
        try:
            with open(transcript_path, 'r') as f:
                for line in f:
                    data = json.loads(line)
                    if data.get("type") == "USER_INPUT":
                        goal_raw = data.get("content", "")
                        match = re.search(r'<USER_REQUEST>(.*?)</USER_REQUEST>', goal_raw, re.DOTALL)
                        if match:
                            goal = match.group(1).strip()
                            if len(goal) > 100:
                                goal = goal[:100] + "..."
                        break
        except Exception as e:
            pass

    report.append({
        "id": entry,
        "date": mod_time,
        "goal": goal,
        "tasks": tasks
    })

print(json.dumps(report, indent=2))
