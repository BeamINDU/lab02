import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// ฟังก์ชันที่ใช้แปลงลิงก์ในรูปแบบ Markdown ให้เป็นลิงก์แบบ Excel
const processLinks = (text: string): string => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let result = text;
  let match;

  // ค้นหาลิงก์ทั้งหมดและแทนที่ด้วย Excel hyperlink formula
  while ((match = linkRegex.exec(text)) !== null) {
    const linkText = match[1];
    const url = match[2];
    // เปลี่ยน Markdown link เป็น Excel Hyperlink formula
    result = result.replace(match[0], `=HYPERLINK("${url}", "${linkText}")`);
  }

  return result;
};

// ฟังก์ชันที่ใช้แปลงข้อความที่เป็นตัวหนาใน Markdown (**) และ HTML (<strong>) ให้เป็นแท็ก <strong>
const processBold = (text: string): { value: string; bold: boolean } => {
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  let bold = false;
  if (/<strong>.*<\/strong>/.test(text)) {
    text = text.replace(/<\/?strong>/g, '').trim();
    bold = true;
  }

  return { value: text, bold };
};

// ฟังก์ชันที่ใช้แปลงข้อความสูตรคณิตศาสตร์ (TeX) เป็นข้อความในรูปแบบที่ Excel รองรับ
const processMathFormula = (text: string): string => {
  if (/(\$\$.*\$\$|\[.*\])/g.test(text)) {
    return text.replace(/\$\$|\\\[|\\\]/g, '').trim();
  }
  return text;
};

// ฟังก์ชันที่ใช้ในการแปลงข้อความในเซลล์
const parseCellContent = (text: string) => {
  text = processLinks(text); // แปลงลิงก์เป็น HYPERLINK formula
  let parsed = processBold(text); // แปลงข้อความที่เป็นตัวหนา
  parsed.value = processMathFormula(parsed.value); // แปลงสูตรคณิตศาสตร์
  return parsed;
};

// ฟังก์ชันหลักที่ใช้ในการส่งออกไฟล์ Excel
export const ExportStyledExcel = async (rawData: string, filename = 'export') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Content');

  const paragraphs = rawData.split('\n\n');
  let rowIndex = 1;

  paragraphs.forEach((paragraph) => {
    const isTable = paragraph.includes('|') && paragraph.split('|').length > 2;

    if (isTable) {
      const tableLines = paragraph.trim().split('\n').filter((line) => line.includes('|'));

      if (tableLines.length < 3) {
        return; // ข้ามตารางที่มีข้อมูลไม่ครบ
      }

      const headers = tableLines[0]
        .split("|")
        .map((h) => h.trim())
        .filter((h) => h !== ""); // กรองค่าว่างออกจาก header

      // หาก header ไม่มีข้อความ (ค่าว่างทั้งหมด) ให้ข้ามตารางนี้
      if (headers.every(header => header === "")) {
        return; // ข้ามการสร้างตารางนี้
      }

      const rows = tableLines.slice(2).map((row) =>
        row
          .split("|")
          .filter((cell, index) => index > 0 && index < row.split("|").length - 1)
          .map((cell) => cell.trim())
      );

      // สร้างแถว header
      const excelRow = worksheet.getRow(rowIndex);
      headers.forEach((header, cIdx) => {
        const parsed = parseCellContent(header);
        const cellRef = excelRow.getCell(cIdx + 1);
        cellRef.value = parsed.value;
        cellRef.font = { bold: true };
        cellRef.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cellRef.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } },
        };
      });

      excelRow.commit();
      rowIndex++;

      // สร้างแถวข้อมูลในตาราง
      rows.forEach((row) => {
        const excelRow = worksheet.getRow(rowIndex);
        row.forEach((cell, cIdx) => {
          const parsed = parseCellContent(cell);
          const cellRef = excelRow.getCell(cIdx + 1);
          cellRef.value = parsed.value;
          cellRef.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          cellRef.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } },
          };
        });
        rowIndex++;
      });

      rowIndex++; // เพิ่มช่องว่างระหว่างตาราง
    } else {
      const lines = paragraph.split('\n');
      lines.forEach((line) => {
        const row = worksheet.getRow(rowIndex);
        const parsed = parseCellContent(line);
        const cell = row.getCell(1);
        cell.value = parsed.value;
        rowIndex++;
      });
      rowIndex++; // เพิ่มช่องว่างระหว่างย่อหน้า
    }
  });

  worksheet.columns.forEach((col) => {
    col.width = 30; // กำหนดความกว้างของคอลัมน์
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, `${filename}.xlsx`);
};
