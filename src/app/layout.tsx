import "@/styles/globals.css";
import { ReactNode } from "react";
import Providers from "./providers";
import Layout from "@/app/components/Layout";
// import Layout from "./components/layout/MainLayout";

export const metadata = {
  title: "OCR",
  description: "Optical Character Recognition",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="h-full">
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}

