import { preferredLanguage } from "@/core/signals";
import type { LangCode, Translations } from "./types";
import { translations } from "./translations";

/** Reactive translation helper — reads preferredLanguage signal */
export function t(key: keyof Translations): string {
  const lang = preferredLanguage.value as LangCode;
  return (translations[lang]?.[key] ??
    translations["en"]?.[key] ??
    key) as string;
}
