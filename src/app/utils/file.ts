export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // สำหรับ image ใช้ readAsDataURL ได้เลย
    if (file.type.startsWith("image/")) {
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    }

    // สำหรับ PDF ใช้ readAsArrayBuffer แล้วแปลง base64
    else if (file.type === "application/pdf") {
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const buffer = reader.result as ArrayBuffer;
        const binary = new Uint8Array(buffer).reduce(
          (acc, byte) => acc + String.fromCharCode(byte),
          ""
        );
        const base64 = `data:application/pdf;base64,${btoa(binary)}`;
        resolve(base64);
      };
      reader.onerror = reject;
    }

    else {
      reject(new Error("Unsupported file type"));
    }
  });
};

export const convertBase64ToBlobUrl = (base64: string): string => {
  // แยกส่วน metadata (เช่น data:image/png;base64,) ออกจากข้อมูลจริง
  const [meta, data] = base64.split(',');

  if (!meta || !data) throw new Error("Invalid base64 format");

  // ดึง mimeType จาก metadata
  const mimeMatch = meta.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || 'application/octet-stream';

  // แปลง base64 string เป็น binary
  const byteCharacters = atob(data);
  const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
  const byteArray = new Uint8Array(byteNumbers);

  // สร้าง Blob แล้วแปลงเป็น Object URL
  const blob = new Blob([byteArray], { type: mimeType });
  return URL.createObjectURL(blob);
};



