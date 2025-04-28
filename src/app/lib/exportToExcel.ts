// utils/exportToExcel.ts
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * ฟังก์ชัน export ข้อมูลเป็น Excel ไฟล์ (.xlsx)
 * @param data - Array ของ object ที่จะ export
 * @param filename - ชื่อไฟล์โดยไม่ต้องใส่นามสกุล (default = 'exported_data')
 */
export const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  filename: string = 'exported_data'
): void => {
  if (!data || data.length === 0) {
    console.error('No data provided for export');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, `${filename}.xlsx`);
};

