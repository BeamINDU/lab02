import { ReactNode } from "react";
import Providers from "./providers";
import Layout from "@/app/components/Layout";
// import PathTracker from "@/app/components/ocr/PathTracker";

export const metadata = {
  title: "OCR",
  description: "Optical Character Recognition",
};

export default function MainLayout({ children }: { children: ReactNode;}) {
  return (
    <Providers>
      <Layout>
        {/* <PathTracker/> */}
        {children}
      </Layout>
    </Providers>
  );
}
