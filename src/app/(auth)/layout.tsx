import { ReactNode } from "react";

export const metadata = {
  title: "OCR Login",
  description: "Optical Character Recognition",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="h-full">
        <main>{children}</main>
      </body>
    </html>
  );
}
