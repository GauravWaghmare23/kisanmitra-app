import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Crop Tracking System",
  description: "Track your crops from farm to table with blockchain transparency. Connect farmers, distributors, and retailers in a secure, traceable supply chain.",
  keywords: "crop tracking, blockchain, agriculture, supply chain, farmers, distributors, retailers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Navigation Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-green-600">
                CropTrace
              </Link>

              <nav className="hidden md:flex space-x-8">
                <Link href="/" className="text-gray-700 hover:text-green-600 transition">
                  Home
                </Link>
                <Link href="/scan" className="text-gray-700 hover:text-green-600 transition">
                  Scan QR
                </Link>
                <Link href="/farmer" className="text-gray-700 hover:text-green-600 transition">
                  Farmers
                </Link>
                <Link href="/distributor" className="text-gray-700 hover:text-green-600 transition">
                  Distributors
                </Link>
                <Link href="/retailer" className="text-gray-700 hover:text-green-600 transition">
                  Retailers
                </Link>
              </nav>

              <div className="flex space-x-4">
                <Link
                  href="/auth/LoginPage"
                  className="text-green-600 hover:text-green-700 font-medium transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/RegisterPage"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">CropTrace</h3>
                <p className="text-gray-400">
                  Revolutionizing agriculture with blockchain transparency and secure crop tracking.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4">For Farmers</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/farmer" className="hover:text-white">Dashboard</Link></li>
                  <li><Link href="/farmer/add-crop" className="hover:text-white">Add Crops</Link></li>
                  <li><Link href="/farmer/payments" className="hover:text-white">Payments</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">For Businesses</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/distributor" className="hover:text-white">Distributors</Link></li>
                  <li><Link href="/retailer" className="hover:text-white">Retailers</Link></li>
                  <li><Link href="/scan" className="hover:text-white">QR Scanner</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                  <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                  <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 CropTrace. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
