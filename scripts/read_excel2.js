const xlsx = require('xlsx');
const workbook = xlsx.readFile('/Users/biw/Documents/jurnal/BIW_Bashundhara_Task_Tracker-1.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
console.log('Row 4:', data[4]);
console.log('Row 5:', data[5]);
console.log('Row 6:', data[6]);
