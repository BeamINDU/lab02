import { ReactNode } from "react";
import Providers from "./providers";
import Layout from "@/app/components/Layout";

export const metadata = {
  title: "OCR",
  description: "Optical Character Recognition",
};

export default function MainLayout({ children }: { children: ReactNode;}) {
  return (
    <Providers>
      <Layout>
        {children}
      </Layout>
    </Providers>
  );
}
