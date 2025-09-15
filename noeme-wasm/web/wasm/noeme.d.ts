import __wbg_init from "./pkg/noeme_wasm";

interface Noeme {
  word: string;
  pronunciation: Pronunciation;
  basic_meanings: Array<BasicMeaningItem>;
  advanced_meanings: Array<AdvancedMeaningItem>;
  sentences: Array<SentenceItem>;
}

interface Pronunciation {
  phonetic_symbol: string;
  audio_url: string;
}

interface BasicMeaningItem {
  attr: string;
  value: string;
}

interface AdvancedMangingValue {
  cn: string;
  en: string;
}

interface AdvancedMeaningItem {
  attr: string;
  values: Array<AdvancedMangingValue>;
}

interface SentenceItem {
  en: string;
  cn: string;
  audio_url: string;
}

declare function explain(word: string): Promise<Noeme>;

export { explain, Noeme };

export default function init(): ReturnType<typeof __wbg_init>;
