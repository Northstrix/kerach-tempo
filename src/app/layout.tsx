import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Kerach Tempo',
  description: 'Turn ordinary text into dynamic, shader-driven visuals.',
  icons: {
    icon: [
      {
        rel: 'icon',
        url: '/logo.webp',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Roboto:wght@100;300;400;500;700;900&family=Lato:wght@100;300;400;700;900&family=Open+Sans:wght@300;400;500;600;700;800&family=Montserrat:wght@100..900&family=Poppins:wght@100;200;300;400;500;600;700;800;900&family=Source+Code+Pro:wght@200..900&family=Nunito:wght@200..1000&family=Raleway:wght@100..900&family=Playfair+Display:wght@400..900&family=Merriweather:wght@300;400;700;900&family=Ubuntu:wght@300;400;500;700&family=Zilla+Slab:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=Work+Sans:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
