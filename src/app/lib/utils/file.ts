export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // ตรวจสอบและลบ data URL prefix (data:image/jpeg;base64,)
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      
      // ตรวจสอบและแก้ไข padding ของ base64
      let cleanBase64 = base64.replace(/[^A-Za-z0-9+/]/g, ''); // ลบ characters ที่ไม่ใช่ base64
      
      // เพิ่ม padding ถ้าจำเป็น
      while (cleanBase64.length % 4 !== 0) {
        cleanBase64 += '=';
      }
      
      // ตรวจสอบว่า base64 ถูกต้องหรือไม่
      try {
        // ทดสอบ decode เพื่อตรวจสอบ
        atob(cleanBase64);
        resolve(cleanBase64);
      } catch (error) {
        console.error('Invalid base64 data:', error);
        reject(new Error('Invalid base64 encoding'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};
export const validateBase64 = (base64String: string): boolean => {
  try {
    // ตรวจสอบ format
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(base64String)) {
      return false;
    }
    
    // ตรวจสอบความยาว (ต้องเป็นคู่ของ 4)
    if (base64String.length % 4 !== 0) {
      return false;
    }
    
    // ทดสอบ decode
    atob(base64String);
    return true;
  } catch {
    return false;
  }
};
// เพิ่มในไฟล์ src/app/lib/utils/file.ts

// ฟังก์ชันสำหรับลดขนาดรูปภาพ
export const resizeImage = (file: File, maxWidth: number = 1024, maxHeight: number = 1024, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // คำนวณขนาดใหม่โดยรักษาอัตราส่วน
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // วาดรูปลงใน canvas
      ctx?.drawImage(img, 0, 0, width, height);

      // แปลงเป็น blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to resize image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

// ฟังก์ชันตรวจสอบว่าต้องลดขนาดหรือไม่
export const shouldResizeImage = (file: File, maxSizeMB: number = 1): boolean => {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB > maxSizeMB;
};

// ฟังก์ชันแสดงขนาดไฟล์ที่อ่านง่าย
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
// เพิ่มฟังก์ชันสำหรับดูขนาดไฟล์จาก base64
export const getBase64Size = (base64String: string): number => {
  try {
    // คำนวณขนาดจาก base64 (โดยประมาณ)
    const padding = (base64String.match(/=/g) || []).length;
    const sizeInBytes = (base64String.length * 3 / 4) - padding;
    return sizeInBytes;
  } catch {
    return 0;
  }
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
