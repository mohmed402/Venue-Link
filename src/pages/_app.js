import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import '../app/globals.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Component {...pageProps} />
      </LanguageProvider>
    </AuthProvider>
  );
} 