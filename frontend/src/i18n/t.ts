import { preferredLanguage } from "@/core/signals";
import { translations } from "./translations";
import type { LangCode, Translations } from "./types";

/** Reactive translation helper — reads preferredLanguage signal */
export function t(key: keyof Translations): string {
	const lang = preferredLanguage.value as LangCode;
	return (translations[lang]?.[key] ??
		translations["en"]?.[key] ??
		key) as string;
}
