import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';
import { Suspense } from 'react';
import Providers from './providers';

export const metadata = {
  title: 'University Student Hub',
  description: 'Learn Together. Share Together. Grow Together.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-bs-theme="light" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('ush_theme')||'light';if(t==='system')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-bs-theme',t)}catch(e){}" }} />
      </head>
      <body>
        <Suspense fallback={null}><Providers>{children}</Providers></Suspense>
      </body>
    </html>
  );
}
