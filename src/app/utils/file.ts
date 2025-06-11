async function urlToFile(url: string, filename: string, mimeType: string = 'image/png'): Promise<File> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: mimeType });
}