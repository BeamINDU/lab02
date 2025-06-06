import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';

// Utility functions (reused from your Excel version)
const processBold = (text: string) => {
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  let bold = false;
  if (/<strong>.*<\/strong>/.test(text)) {
    text = text.replace(/<\/?strong>/g, '').trim();
    bold = true;
  }
  return { value: text, bold };
};

const processMathFormula = (text: string) => {
  const mathFormulaRegex = /(\$\$.*\$\$|\\\[.*\\\])/g;
  if (mathFormulaRegex.test(text)) {
    const formula = text.replace(/\$\$|\[|\]/g, '').trim();
    return formula;
  }
  return text;
};

const processLinks = (text: string) => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const matches = [...text.matchAll(linkRegex)];
  if (matches.length === 0) {
    return { text, url: '', link: false };
  }
  const match = matches[0];
  return {
    text: match[1],
    url: match[2],
    link: true,
  };
};

const parseCellContent = (text: string) => {
  const linkParsed = processLinks(text);
  let value = linkParsed.text;
  const url = linkParsed.url;
  const hasLink = linkParsed.link;

  const boldParsed = processBold(value);
  value = boldParsed.value;
  const isBold = boldParsed.bold;

  value = processMathFormula(value);

  return { value, url, isBold, hasLink };
};

export const ExportWord = async (rawData: string, filename = 'export word') => {
  const paragraphs = rawData.split('\n\n');
  const docChildren: any[] = [];

  paragraphs.forEach((paragraph) => {
    const isTable = paragraph.includes('|') && paragraph.split('|').length > 2;

    if (isTable) {
      const tableLines = paragraph.trim().split('\n').filter((line) => line.includes('|'));
      if (tableLines.length < 2) return;

      const headers = tableLines[0]
        .split('|')
        .map((h) => h.trim())
        .filter((h) => h !== "");

      if (headers.every((header) => header === "")) return;

      const rows = tableLines.slice(2).map((row) =>
        row
          .split('|')
          .filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1)
          .map((cell) => cell.trim())
      );

      const tableRows: TableRow[] = [];

      // Header row
      const headerCells = headers.map((text) => {
        const parsed = parseCellContent(text);
        return new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [
                parsed.hasLink
                  ? new TextRun({ text: parsed.value, bold: true, style: "Hyperlink" })
                  : new TextRun({ text: parsed.value, bold: true }),
              ],
            }),
          ],
        });
      });
      tableRows.push(new TableRow({ children: headerCells }));

      // Data rows
      rows.forEach((row) => {
        const dataCells = row.map((text) => {
          const parsed = parseCellContent(text);
          return new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  parsed.hasLink
                    ? new TextRun({ text: parsed.value, style: "Hyperlink" })
                    : new TextRun({ text: parsed.value, bold: parsed.isBold }),
                ],
              }),
            ],
          });
        });
        tableRows.push(new TableRow({ children: dataCells }));
      });

      docChildren.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    } else {
      const lines = paragraph.split('\n');
      lines.forEach((line) => {
        const parsed = parseCellContent(line);
        const run = parsed.hasLink
          ? new TextRun({ text: parsed.value, style: "Hyperlink" })
          : new TextRun({ text: parsed.value, bold: parsed.isBold });

        docChildren.push(new Paragraph({ children: [run] }));
      });
    }

    docChildren.push(new Paragraph("")); // spacing
  });

  const doc = new Document({
    sections: [{ children: docChildren }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
};
