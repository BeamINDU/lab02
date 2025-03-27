"use client";

import OcrReader from './components/OcrReader';

const Home = () => {
  return (
    <div style={{ padding: 10}}>
      <h1 style={{ fontWeight: 800, fontSize: 20 }}>
        OCR with Tesseract.js in Next.js
      </h1>
      <br />
      <OcrReader />
    </div>
  );
};

export default Home;