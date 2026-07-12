import json

with open('/Users/biw/Documents/jurnal/full_report.json', 'r') as f:
    data = json.load(f)

# Group by date and sort chronologically
from collections import defaultdict
by_date = defaultdict(list)

for conv in data:
    by_date[conv['date']].append(conv)

sorted_dates = sorted(by_date.keys())

md = "# 30-Day Activity Report (Chronological)\n\n"
md += "Here is the exact, uncompressed history of all individual tasks and conversations we've had over the past 30 days, ordered by date.\n\n"

for date in sorted_dates:
    md += f"## {date}\n\n"
    for conv in by_date[date]:
        # Only list it if there are tasks, or if there's a goal
        if not conv['tasks']:
            md += f"**Goal/Discussion:** {conv['goal']}\n\n"
        else:
            md += f"**Goal/Discussion:** {conv['goal']}\n\n"
            for task in conv['tasks']:
                md += f"{task}\n"
            md += "\n"

with open('/Users/biw/.gemini/antigravity-ide/brain/4c5ba094-61b6-4734-968d-a50928f0467b/activity_report_30_days.md', 'w') as f:
    f.write(md)
