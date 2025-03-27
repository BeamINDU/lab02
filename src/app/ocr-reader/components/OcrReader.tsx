'use client';

import { useState } from 'react';
import { createWorker } from 'tesseract.js';

const OcrReader = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<string>('');
  const [ocrStatus, setOcrStatus] = useState<string>('');

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
      setOcrResult(''); // Reset OCR result
      setOcrStatus(''); // Reset status
    }
  };

  const readImageText = async () => {
    if (!selectedImage) return;

    setOcrStatus('Processing...');
    const worker = await createWorker('eng', 1, {
      logger: m => console.log(m), // Add logger here
    });

    try {
      const {
        data: { text },
      } = await worker.recognize(selectedImage);

      setOcrResult(text);
      setOcrStatus('Completed');
    } catch (error) {
      console.error(error);
      setOcrStatus('Error occurred during processing.');
    } finally {
      await worker.terminate();
    }
  };

  return (
    <div>
      <input type='file' accept='image/*' onChange={handleImageChange} />

      {selectedImage && (
        <img
          src={URL.createObjectURL(selectedImage)}
          alt='Uploaded content'
          width={350}
          style={{ marginTop: 15 }}
        />
      )}

      <div style={{ marginTop: 15 }}>
        <button
          onClick={readImageText}
          style={{
            background: '#FFFFFF',
            borderRadius: 7,
            color: '#000000',
            padding: 5,
          }}
        >
          Submit
        </button>
      </div>

      <p style={{ marginTop: 20, fontWeight: 700 }}>Status:</p>
      <p>{ocrStatus}</p>
      <h3 style={{ marginTop: 10, fontWeight: 700 }}>Extracted Text:</h3>
      <p
        dangerouslySetInnerHTML={{
          // clear html tags and or unwanted characters
          __html: ocrResult
            .replace(/\n/g, '<br />')
            .replace(/[=,—,-,+]/g, ' '),
        }}
        style={{
          border: '1px solid white',
          width: 'fit-content',
          padding: 10,
          marginTop: 10,
          borderRadius: 10,
        }}
      />
    </div>
  );
};

export default OcrReader;