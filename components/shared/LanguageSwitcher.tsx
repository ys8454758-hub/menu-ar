"use client";

import { useEffect, useState } from "react";
import { GlobeIcon } from "lucide-react";

export default function LanguageSwitcher() {
  const [locale, setLocale] = useState(() => {
    // Get locale from localStorage or navigator
    const savedLocale = localStorage.getItem("livin3d-locale");
    if (savedLocale) return savedLocale;
    
    const browserLocale = navigator.language.split("-")[0];
    if (["en", "kn", "hi"].includes(browserLocale)) return browserLocale;
    
    return "en"; // default
  });
  
  const options = [
    { code: "en", name: "English", native: "English" },
    { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
    { code: "hi", name: "Hindi", native: "हिन्दी" },
  ];

  useEffect(() => {
    // Save to localStorage when locale changes
    localStorage.setItem("livin3d-locale", locale);
    // In a real app with next-intl, we'd use their routing
    // For now, we'll rely on browser language detection
  }, [locale]);

  const handleLanguageChange = (code: string) => {
    setLocale(code);
    // In a real implementation with next-intl, this would trigger a locale change
    // For now, we just update state and localStorage
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={() => {
          // Cycle through languages
          const currentIndex = options.findIndex((o) => o.code === locale);
          const nextIndex = (currentIndex + 1) % options.length;
          handleLanguageChange(options[nextIndex].code);
        }}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-ui text-text-secondary hover:text-text-primary transition-colors rounded-none border border-border hover:border-plasma/50"
      >
        <GlobeIcon className="h-4 w-4" />
        <span className="hidden md:inline">{options.find((o) => o.code === locale)?.name}</span>
      </button>
    </div>
  );
}