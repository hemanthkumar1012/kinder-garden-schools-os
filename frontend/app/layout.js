import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kinder Garden Schools OS",
  description: "Admission + Gallery + Feedback + Webinars for Kinder Garden Schools",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className + " min-h-screen bg-[#f6faf8] text-[#18372a] antialiased"}>
        {children}
      </body>
    </html>
  );
}