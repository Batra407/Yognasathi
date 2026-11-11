import "./globals.css";
import SmoothScrollProvider from "@/components/animations/SmoothScrollProvider";
import ScrollProgress from "@/components/animations/ScrollProgress";

export const metadata = {
  title: {
    default: "YojanaSathi — Government Schemes, Simplified with Conversational AI",
    template: "%s | YojanaSathi",
  },
  description:
    "Discover central and state government schemes that match your needs. Search verified schemes in Hindi, English, Punjabi, and Hinglish with an intelligent voice assistant.",
  keywords: [
    "Government Schemes India",
    "Yojana",
    "Sarkari Yojana",
    "Welfare Schemes",
    "Multilingual Government Portal",
    "Citizen Welfare",
    "PM Schemes",
    "State Welfare Schemes",
    "Voice Assistant Hindi",
    "Punjab Schemes",
    "Haryana Schemes",
  ],
  openGraph: {
    title: "YojanaSathi — Intelligent Government Scheme Discovery Platform",
    description:
      "Explore official citizen welfare schemes using natural conversational voice and text in Hindi, English, and Punjabi.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#FFFFFF] text-[#0F172A] font-sans selection:bg-[#F5A623] selection:text-white">
        <SmoothScrollProvider>
          <ScrollProgress />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
