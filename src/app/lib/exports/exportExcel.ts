import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';


// ฟังก์ชันแปลง **ตัวหนา** หรือ <strong> ให้เป็นตัวหนา
const processBold = (text: string) => {
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  let bold = false;
  if (/<strong>.*<\/strong>/.test(text)) {
    text = text.replace(/<\/?strong>/g, '').trim();
    bold = true;
  }

  return { value: text, bold };
};

// ฟังก์ชันลบเครื่องหมายสูตรคณิตศาสตร์
const processMathFormula = (text: string) => {
  const mathFormulaRegex = /(\$\$.*\$\$|\\\[.*\\\])/g;

  if (mathFormulaRegex.test(text)) {
    const formula = text.replace(/\$\$|\[|\]/g, '').trim();
    return formula;
  }

  return text;
};


// ฟังก์ชันแปลงลิงก์ Markdown เป็น Excel HYPERLINK formula
const processLinks = (text: string) => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const matches = [...text.matchAll(linkRegex)];

  if (matches.length === 0) {
    return { text, formula: '', link: false };
  }

  const match = matches[0];
  return {
    text: match[1],
    formula: `HYPERLINK("${match[2]}", "${match[1]}")`,
    link: true,
  };
};

// รวมการ parse ข้อความ
const parseCellContent = (text: string) => {
  const linkParsed = processLinks(text);
  let value = linkParsed.text;
  const formula = linkParsed.formula;
  const hasLink = linkParsed.link;

  const boldParsed = processBold(value);
  value = boldParsed.value;
  const isBold = boldParsed.bold;

  value = processMathFormula(value);

  return { value, formula, isBold, hasLink };
};

// ฟังก์ชันกลางจัดการค่าที่ parse แล้ว
const applyParsedContent = (cell: ExcelJS.Cell, parsed: { value: string; formula: string; isBold: boolean; hasLink: boolean }, forceBold = false) => {
  if (parsed.hasLink) {
    cell.value = {
      formula: parsed.formula,
      result: parsed.value,
    };
  } else {
    cell.value = parsed.value;
  }

  if (parsed.isBold || forceBold) {
    cell.font = { bold: true };
  }
};


// กำหนด border ให้ cell
const setCellBorder = (cellRef: ExcelJS.Cell) => {
  cellRef.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } },
  };
};


// ฟังก์ชันหลักสำหรับ export Excel
export const ExportExcel = async (rawData: string, filename = 'export excel') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  const paragraphs = rawData.split('\n\n');
  let rowIndex = 1;

  paragraphs.forEach((paragraph) => {
    const isTable = paragraph.includes('|') && paragraph.split('|').length > 2;

    if (isTable) {
      const tableLines = paragraph.trim().split('\n').filter((line) => line.includes('|'));

      if (tableLines.length < 2) {
        return; // ข้ามตารางที่ไม่สมบูรณ์
      }

      const headers = tableLines[0]
        .split('|')
        .map((h) => h.trim())
        .filter((h) => h !== "");

      if (headers.every(header => header === "")) {
        return; // ข้ามตารางไม่มีหัวข้อ
      }

      const rows = tableLines.slice(2).map((row) =>
        row
          .split('|')
          .filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1)
          .map((cell) => cell.trim())
      );

      // เขียนแถว header
      const headerRow = worksheet.getRow(rowIndex);
      headers.forEach((header, cIdx) => {
        const parsed = parseCellContent(header);
        const cellRef = headerRow.getCell(cIdx + 1);

        applyParsedContent(cellRef, parsed, true); // <<== ส่ง forceBold = true

        cellRef.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        setCellBorder(cellRef);
      });
      headerRow.commit();
      rowIndex++;

      // เขียนแถวข้อมูล
      rows.forEach((row) => {
        const dataRow = worksheet.getRow(rowIndex);
        row.forEach((cell, cIdx) => {
          const parsed = parseCellContent(cell);
          const cellRef = dataRow.getCell(cIdx + 1);

          applyParsedContent(cellRef, parsed);

          cellRef.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          setCellBorder(cellRef);
        });
        rowIndex++;
      });

      rowIndex++; // เว้นบรรทัด
    } else {
      const lines = paragraph.split('\n');
      lines.forEach((line) => {
        const row = worksheet.getRow(rowIndex);
        const parsed = parseCellContent(line);
        const cell = row.getCell(1);

        applyParsedContent(cell, parsed);

        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: false };
        rowIndex++;
      });
      rowIndex++;
    }
  });

  worksheet.columns.forEach((col) => {
    col.width = 30;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, `${filename}.xlsx`);
};
