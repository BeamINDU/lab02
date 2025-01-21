"use client"
import { UserCircle, Settings, Menu } from 'lucide-react';
import Navbar from './Nav';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />
      <main className="bg-cover bg-center h-screen" style={{ backgroundImage: "url('/images/bg-aicam.png')" }}>
        <header className="bg-navy-800 py-4 px-6 flex justify-between items-center">
        </header>
        <div className="absolute  inset-0 bg-gray-500 opacity-98 rounded-1" style={{ marginBottom: -30, marginLeft: 30, marginRight: 30, marginTop: 100, backgroundColor: '#D9D9D9' }}>
          <div className="absolute  inset-0 bg-gray-300 opacity-95 rounded-1" style={{ width: "97.5%", marginBottom: 25, marginLeft: 25, marginRight: 30, marginTop: 22, backgroundColor: '#074fb5' }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}