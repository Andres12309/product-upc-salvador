import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import { SessionProvider } from '@/modules/auth/hooks/session-context';
import { ThemeRegistry } from '@/modules/shared/components/theme-registry';
import './globals.css';

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Catálogo de productos',
  description: 'Acceso al catálogo de productos UPC',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={roboto.className}>
      <body>
        <ThemeRegistry>
          <SessionProvider>{children}</SessionProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
