import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PAZ ORTEGA | Inteligencia Artificial con Gobernanza",
  description: "Gobernanza, copilotos especializados y memoria empresarial para decisiones confiables.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
