import { ReactNode } from "react";

export const metadata = {
  title: "OCR Login",
  description: "Optical Character Recognition",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <main>{children}</main>
  );
}
