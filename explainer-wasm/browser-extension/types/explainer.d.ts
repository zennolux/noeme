interface Explainer {
  word: string;
  pronunciation: Pronunciation;
  meanings: Array<MeaningItem>;
  sentences: Array<SentenceItem>;
}

interface Pronunciation {
  phonetic_symbol: string;
  audio_url: string;
}

interface MeaningValue {
  cn: string;
  en: string;
}

interface MeaningItem {
  attr: string;
  values: Array<MeaningValue>;
}

interface SentenceItem {
  en: string;
  cn: string;
  audio_url: string;
}
