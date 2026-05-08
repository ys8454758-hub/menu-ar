"use client";

import { useEffect, useState } from "react";

import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

type Locale = "en" | "kn" | "hi";

const LOCALES: { code: Locale; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "EN" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी" },
];

const STORAGE_KEY = "menuAR_locale";

function getBrowserLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const browserLang = navigator.language.split("-")[0];
  if (browserLang === "kn") return "kn";
  if (browserLang === "hi") return "hi";
  return "en";
}

export default function LanguageSwitcher({ className }: { className?: string }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && LOCALES.some((l) => l.code === stored)) {
      setLocale(stored);
    } else {
      const browserLocale = getBrowserLocale();
      setLocale(browserLocale);
      localStorage.setItem(STORAGE_KEY, browserLocale);
    }
  }, []);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    setIsOpen(false);
  };

  const currentLocale = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-border bg-terminal hover:border-plasma/50 transition-colors"
      >
        <Globe className="w-4 h-4 text-text-secondary" />
        <span className="text-body-xs font-ui text-text-primary">
          {currentLocale.nativeLabel}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-terminal border border-border shadow-lg">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => changeLocale(l.code)}
                className={cn(
                  "w-full px-4 py-2 text-left hover:bg-surface transition-colors flex items-center gap-2",
                  locale === l.code ? "bg-plasma/10 text-plasma" : "text-text-primary"
                )}
              >
                <span className="text-body-sm font-ui">{l.nativeLabel}</span>
                <span className="text-body-xs text-text-secondary">{l.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function useTranslation() {
  const [translations, setTranslations] = useState<Record<string, unknown>>({});
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    const currentLocale = stored || getBrowserLocale();
    setLocale(currentLocale);

    import(`@/i18n/${currentLocale}.json`).then((data) => {
      setTranslations(data);
    });
  }, []);

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: unknown = translations;
    for (const k of keys) {
      if (value && typeof value === "object") {
        value = (value as Record<string, unknown>)[k];
      } else {
        break;
      }
    }
    return typeof value === "string" ? value : key;
  };

  return { t, locale };
}