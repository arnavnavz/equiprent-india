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
        <footer className="bg-slate-900 text-slate-400 py-8 sm:py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              <div className="col-span-2 sm:col-span-1">
                <h3 className="text-white font-bold text-lg mb-3 sm:mb-4">🏗️ EquipRent</h3>
                <p className="text-xs sm:text-sm">India&apos;s trusted marketplace for renting heavy machinery with operators.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Equipment</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <li>JCB / Backhoe</li>
                  <li>Cranes</li>
                  <li>Tractors</li>
                  <li>Trucks</li>
                  <li>Excavators</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Cities</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <li>Mumbai</li>
                  <li>Delhi NCR</li>
                  <li>Bangalore</li>
                  <li>Hyderabad</li>
                  <li>Chennai</li>
                </ul>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Support</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <li>Help Center</li>
                  <li>Safety Guidelines</li>
                  <li>Terms of Service</li>
                  <li>Privacy Policy</li>
                </ul>
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm">📞 1800-EQUIP-RENT</p>
              </div>
            </div>
            <div className="border-t border-slate-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
              © 2024 EquipRent India. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
