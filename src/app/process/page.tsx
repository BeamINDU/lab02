"use client";

import ProcessPage from "./components/ProcessPage";

interface PageProps {
  backUrl: string;
}

export default function Page({ backUrl }: PageProps) { 
  return <ProcessPage backUrl={backUrl} />;
}