import arJSON from "./translations/ar.json";
import bnJSON from "./translations/bn.json";
import deJSON from "./translations/de.json";
import enJSON from "./translations/en.json";
import esJSON from "./translations/es.json";
import frJSON from "./translations/fr.json";
import hiJSON from "./translations/hi.json";
import itJSON from "./translations/it.json";
import plJSON from "./translations/pl.json";
import ptJSON from "./translations/pt.json";
import zhJSON from "./translations/zh.json";
import type { Translations } from "./types";

export const translations: Partial<Record<string, Partial<Translations>>> = {
	en: enJSON as Partial<Translations>,
	es: esJSON as Partial<Translations>,
	fr: frJSON as Partial<Translations>,
	pl: plJSON as Partial<Translations>,
	ar: arJSON as Partial<Translations>,
	bn: bnJSON as Partial<Translations>,
	pt: ptJSON as Partial<Translations>,
	de: deJSON as Partial<Translations>,
	it: itJSON as Partial<Translations>,
	hi: hiJSON as Partial<Translations>,
	zh: zhJSON as Partial<Translations>,
};
