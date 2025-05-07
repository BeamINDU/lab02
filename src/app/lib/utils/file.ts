export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // สำหรับ image
    if (file.type.startsWith("image/")) {
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    }

    // สำหรับ PDF
    else if (file.type === "application/pdf") {
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    }

    else {
      reject(new Error("Unsupported file type"));
    }
  });
};

export const convertBase64ToBlobUrl = (base64: string, mimeType = 'image/png'): string => {
  let data = base64;
  let detectedMime = mimeType;

  if (base64.includes(',')) {
    const [meta, rawData] = base64.split(',');
    if (!rawData) throw new Error("Invalid base64 format");
    data = rawData;

    const mimeMatch = meta.match(/data:(.*?);base64/);
    if (mimeMatch) {
      detectedMime = mimeMatch[1];
    }
  }

  try {
    const byteCharacters = atob(data);
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: detectedMime });
    return URL.createObjectURL(blob);
  } catch (err) {
    throw new Error("Invalid base64 content");
  }
};

export const convertBlobToFile = async (blobUrl: string, fileName: string , fileType: string): Promise<File> => {
  const response = await fetch(blobUrl ?? "");
  const blob = await response.blob();

  const file = new File([blob], fileName, { type: fileType });
  return file;
}
