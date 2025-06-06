// "use client";

// import ReadingPage from "./components/ReadingPage";
// // import { ProcessProvider } from "../context/ProcessContext";
// // import ProcessLayout from "../components/layout/ProcessLayout";

// export default function Page() {
//   return (
//       // <ProcessLayout>
//         <ReadingPage />
//       // </ProcessLayout>
//   );
// }


import OcrForm from './components/OcrForm';

export default function OcrPage() {
  return (
    <main className="p-2">
      <h1 className="text-2xl font-bold mb-4">OCR Upload</h1>
      <OcrForm />
    </main>
  );
}