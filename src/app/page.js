"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CinematicVideoHero from "@/components/cinematic/CinematicVideoHero";
import AssistantSection from "@/components/sections/AssistantSection";
import SchemeDiscovery from "@/components/sections/SchemeDiscovery";
import OpportunitySection from "@/components/sections/OpportunitySection";
import WorkflowSection from "@/components/sections/WorkflowSection";
import ProductShowcase from "@/components/sections/ProductShowcase";
import TrustSection from "@/components/sections/TrustSection";
import FinalCTA from "@/components/sections/FinalCTA";
import CinematicPresentation from "@/components/presentation/CinematicPresentation";

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState("hi-IN");
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  const mapLangToShort = (lang) => {
    if (lang === "en-IN" || lang === "en") return "en";
    if (lang === "pa-IN" || lang === "pa") return "pa";
    return "hi";
  };

  const handleLanguageChange = (langCode) => {
    const fullCode =
      langCode === "en" ? "en-IN" : langCode === "pa" ? "pa-IN" : "hi-IN";
    setSelectedLanguage(fullCode);
  };

  const handleOpenSpeakModal = () => {
    const el = document.getElementById("assistant");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOpenTypeModal = () => {
    const el = document.getElementById("text-requirement");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      el.focus();
    } else {
      const ast = document.getElementById("assistant");
      if (ast) ast.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePlayPresentation = () => {
    setIsPresentationOpen(true);
  };

  const handleClosePresentation = () => {
    setIsPresentationOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F172A] font-sans selection:bg-[#F5A623] selection:text-white">
      {/* SECTION 1: Clean White Navigation Bar */}
      <Navbar
        selectedLanguage={mapLangToShort(selectedLanguage)}
        onSelectLanguage={handleLanguageChange}
        onPlayPresentation={handlePlayPresentation}
      />

      {/* Main Flow */}
      <main className="flex-grow">
        {/* SECTION 2: Clean Cinematic Video Hero (Scale.com inspired) */}
        <CinematicVideoHero onPlayPresentation={handlePlayPresentation} />

        {/* SECTION 3: Unified AI Voice & Text Assistant */}
        <AssistantSection selectedLanguage={selectedLanguage} />

        {/* SECTION 4: Discover Government Schemes (#discovery, verified registry) */}
        <SchemeDiscovery />

        {/* SECTION 5: Departments & Categories (Real departments & citizen segments) */}
        <OpportunitySection />

        {/* SECTION 6: How It Works & Architecture Pipeline */}
        <WorkflowSection />
        <ProductShowcase />

        {/* SECTION 7: Official Sources and Transparency ("Democratizing Access to Public Welfare") */}
        <TrustSection
          onOpenSpeak={handleOpenSpeakModal}
          onOpenType={handleOpenTypeModal}
        />

        {/* SECTION 8: Final Call To Action ("Your opportunity starts here.") */}
        <FinalCTA
          onOpenAssistant={handleOpenSpeakModal}
          onPlayPresentation={handlePlayPresentation}
        />
      </main>

      {/* Unified Minimal Footer */}
      <Footer />

      {/* Interactive Cinematic Presentation Modal */}
      {isPresentationOpen && (
        <CinematicPresentation onClose={handleClosePresentation} />
      )}
    </div>
  );
}
