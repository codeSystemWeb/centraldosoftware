import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "CodeSystemWeb STORE | Licenças e Produtos Digitais",
    template: "%s | CodeSystemWeb STORE"
  },
  description:
    "Compre licenças de software, cursos e produtos digitais com entrega automática e acesso imediato após o pagamento.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "CodeSystemWeb STORE",
    title: "CodeSystemWeb STORE | Licenças e Produtos Digitais",
    description:
      "Compre licenças de software, cursos e produtos digitais com entrega automática e acesso imediato após o pagamento.",
    images: ["/logo.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeSystemWeb STORE",
    description: "Licenças e produtos digitais com acesso imediato."
  },
  robots: {
    index: true,
    follow: true
  },
  verification: {
    google: "uKwgTBoMJ4VqDpL_Nh5fSpka-baYOm3cWVfnOWkLO-s",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="font-body">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">{children}</main>
            <Footer />
            <WhatsAppButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
