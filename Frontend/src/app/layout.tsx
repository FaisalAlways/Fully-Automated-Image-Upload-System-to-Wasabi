import "./globals.css";
import { Hind_Siliguri } from 'next/font/google';

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={hindSiliguri.className}>{children}</body>
    </html>
  );
}
