import "@/app/globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "CSI - OCR",
  description: "Optical Character Recognition",
};

export default function RootLayout({ children }: { children: ReactNode;}) {
  return (
    <html lang="en">
      <body className="h-full">
        {children}
      </body>
    </html>
  );
}
