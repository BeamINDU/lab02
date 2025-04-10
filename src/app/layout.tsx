"use client";

import localFont from "next/font/local";
import "../styles/globals.css";
import Layout from "./components/layout/MainLayout";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
// import ThemeSwitcher from "./components/theme/ThemeSwitcher";
// import { store } from "../app/store/store"; 
import { store } from '../app/redux/store';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <SessionProvider>
          <Provider store={store}>
            <Layout>
              {/* <ThemeSwitcher /> */}
              <main>{children}</main>
            </Layout>
          </Provider>
        </SessionProvider>
      </body>
    </html>
  );
}
