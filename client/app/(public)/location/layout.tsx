import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'macyemacye Shop Location - kkt39j, Nyakarambi, Kigali, Rwanda',
  description: 'Visit macyemacye shop located at kkt39j, Nyakarambi, Kigali, Rwanda. Near Bank of Kigali. Premium products, fast delivery, and exceptional service.',
  keywords: [
    'macyemacye shop location',
    'kkt39j Kigali',
    'Nyakarambi shopping',
    'Bank of Kigali nearby',
    'Rwanda online shop',
    'Kigali e-commerce store',
    'shop near me Kigali',
    'macyemacye store address',
  ],
  openGraph: {
    title: 'macyemacye Shop Location - Kigali, Rwanda',
    description: 'Find us at kkt39j, Nyakarambi, Kigali, Rwanda. Near Bank of Kigali.',
    type: 'website',
    locale: 'en_RW',
    siteName: 'macyemacye',
    images: [
      {
        url: '/logoo.png',
        width: 1200,
        height: 630,
        alt: 'macyemacye Shop Location',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'macyemacye Shop Location - Kigali, Rwanda',
    description: 'Visit us at kkt39j, Nyakarambi, Kigali, Rwanda. Near Bank of Kigali.',
  },
  alternates: {
    canonical: 'https://macyemacye.com/location',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function LocationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
