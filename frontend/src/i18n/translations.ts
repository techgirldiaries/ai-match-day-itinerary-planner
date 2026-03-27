import type { Translations } from "./types";
import enJSON from "./translations/en.json";
import esJSON from "./translations/es.json";
import frJSON from "./translations/fr.json";
import plJSON from "./translations/pl.json";
import arJSON from "./translations/ar.json";
import bnJSON from "./translations/bn.json";
import ptJSON from "./translations/pt.json";
import deJSON from "./translations/de.json";
import itJSON from "./translations/it.json";
import hiJSON from "./translations/hi.json";
import zhJSON from "./translations/zh.json";

export const translations: Partial<Record<string, Partial<Translations>>> = {
  en: enJSON,
  es: esJSON,
  fr: frJSON,
  pl: plJSON,
  ar: arJSON,
  bn: bnJSON,
  pt: ptJSON,
  de: deJSON,
  it: itJSON,
  hi: hiJSON,
  zh: zhJSON,
};
