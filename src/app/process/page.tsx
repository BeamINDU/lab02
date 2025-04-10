// app/process/page.tsx

"use client";

// import { ProcessProvider } from "../context/ProcessContext"
// import ProcessLayout from "../components/layout/ProcessLayout";
import ProcessPage from "./components/ProcessPage";

export default function Page() { 
  return (
    // <ProcessLayout>
      <ProcessPage backUrl="/" />
    // </ProcessLayout>
  ); 
}