export const convertFileSizeToMB = (filesize: number | undefined): string => {
  if (!filesize) return '';
  const sizeInMB = filesize / 1024 / 1024;
  return sizeInMB.toFixed(2); 
};

export function formatDate(date: Date): string {
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
}

