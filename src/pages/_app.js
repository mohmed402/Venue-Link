import { UnifiedAuthProvider } from '../contexts/UnifiedAuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import '../app/globals.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <UnifiedAuthProvider>
      <LanguageProvider>
        <Component {...pageProps} />
      </LanguageProvider>
    </UnifiedAuthProvider>
  );
} 