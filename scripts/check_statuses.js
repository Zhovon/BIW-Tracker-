const xlsx = require('xlsx');
const workbook = xlsx.readFile('/Users/biw/Documents/jurnal/BIW_Bashundhara_Task_Tracker-1.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

const statuses = new Set();
for (let i = 4; i < data.length; i++) {
  const row = data[i];
  if (row && row[3]) {
    statuses.add(row[5] ? row[5].toString().trim() : 'EMPTY');
  }
}
console.log(Array.from(statuses));
