export const convertFileSizeToMB = (filesize: number | undefined): string => {
  if (!filesize) return '';
  const sizeInMB = filesize / 1024 / 1024;
  return sizeInMB.toFixed(2); 
};
