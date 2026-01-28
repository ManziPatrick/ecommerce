import { Poppins } from "next/font/google";
import "./globals.css";
import ClientProviders from "./ClientProviders";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  metadataBase: new URL("https://macyemacye.com"), // Replace with actual domain
  title: {
    default: "macyemacye | Premium Shopping Experience",
    template: "%s | macyemacye",
  },
  description: "Discover the best products from top local vendors in Rwanda. Shop electronics, fashion, home goods, and more with fast delivery.",
  keywords: ["ecommerce", "shopping", "rwanda", "kigali", "fashion", "electronics", "online store"],
  authors: [{ name: "macyemacye Team" }],
  creator: "macyemacye",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://macyemacye.com",
    title: "macyemacye | Premium Shopping Experience",
    description: "Discover the best products from top local vendors in Rwanda.",
    siteName: "macyemacye",
    images: [
      {
        url: "/og-image.jpg", // Ensure this exists or use a placeholder
        width: 1200,
        height: 630,
        alt: "macyemacye - Premium Shopping",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "macyemacye | Premium Shopping Experience",
    description: "Discover the best products from top local vendors in Rwanda.",
    images: ["/og-image.jpg"],
    creator: "@macyemacye",
  },
  icons: {
    icon: "/logoo.png",
    shortcut: "/logoo.png",
    apple: "/apple-touch-icon.png",
  },
  publisher: "macyemacye",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://accounts.google.com/gsi/client" async></script>
      </head>
      <body className={`${poppins.variable} antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
