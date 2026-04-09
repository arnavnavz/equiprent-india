import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EquipRent India — Heavy Machinery Rental",
  description: "Book JCBs, Cranes, Tractors, Trucks & more. India's trusted heavy equipment rental marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-white font-bold text-lg mb-4">🏗️ EquipRent</h3>
                <p className="text-sm">India&apos;s trusted marketplace for renting heavy machinery with operators. Connecting equipment owners with contractors since 2024.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Equipment</h4>
                <ul className="space-y-2 text-sm">
                  <li>JCB / Backhoe Loaders</li>
                  <li>Cranes</li>
                  <li>Tractors</li>
                  <li>Trucks & Tippers</li>
                  <li>Excavators</li>
                  <li>Concrete Mixers</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Cities</h4>
                <ul className="space-y-2 text-sm">
                  <li>Mumbai</li>
                  <li>Delhi NCR</li>
                  <li>Bangalore</li>
                  <li>Hyderabad</li>
                  <li>Chennai</li>
                  <li>Pune</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Support</h4>
                <ul className="space-y-2 text-sm">
                  <li>Help Center</li>
                  <li>Safety Guidelines</li>
                  <li>Terms of Service</li>
                  <li>Privacy Policy</li>
                </ul>
                <p className="mt-4 text-sm">📞 1800-EQUIP-RENT</p>
              </div>
            </div>
            <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
              © 2024 EquipRent India. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
