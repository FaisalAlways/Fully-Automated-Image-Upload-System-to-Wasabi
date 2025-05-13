import "./globals.css";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="w-[390px]">{children}</body>
    </html>
  );
}
