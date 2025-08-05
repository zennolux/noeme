use anyhow::{anyhow, Ok, Result};
use scraper::{selectable::Selectable, Html, Selector};
use serde::Serialize;
use voca_rs::strip;

#[derive(Debug, Serialize)]
struct Pronunciation {
    phonetic_symbol: String,
    audio_url: String,
}

#[derive(Debug, Serialize)]
struct MeaningValue {
    cn: String,
    en: String,
}

#[derive(Debug, Serialize)]
struct MeaningItem {
    attr: String,
    values: Vec<MeaningValue>,
}

#[derive(Debug, Serialize)]
struct SentenceItem {
    en: String,
    cn: String,
    audio_url: String,
}

#[derive(Debug, Serialize)]
pub struct Dictionary {
    word: String,
    pronunciation: Pronunciation,
    meanings: Vec<MeaningItem>,
    sentences: Vec<SentenceItem>,
}

struct Source {
    document: Html,
    pronunciation_selector: Selector,
    audio_selector: Selector,
    meanings_selector: Selector,
    meaning_attr_selector: Selector,
    meaning_items_selector: Selector,
    meaning_item_cn_selector: Selector,
    meaning_item_en_selector: Selector,
    sentence_items_selector: Selector,
    sentence_item_en_selector: Selector,
    sentence_item_cn_selector: Selector,
    sentence_item_audio_selector: Selector,
    no_results_selector: Selector,
}

const URL: &str = "https://cn.bing.com";

impl Source {
    #[tokio::main]
    async fn new(word: &str) -> Result<Self> {
        let url = format!("{}/dict/search?q={}", URL, word);
        let html = reqwest::get(url).await?.text().await?;

        Ok(Self {
            document: Html::parse_document(html.as_str()),
            pronunciation_selector: Selector::parse(".hd_prUS").unwrap(),
            audio_selector: Selector::parse("#bigaud_us").unwrap(),
            meanings_selector: Selector::parse("#newLeId .each_seg").unwrap(),
            meaning_attr_selector: Selector::parse(".pos_lin .pos").unwrap(),
            meaning_items_selector: Selector::parse(".def_pa").unwrap(),
            meaning_item_cn_selector: Selector::parse(".bil, .b_primtxt").unwrap(),
            meaning_item_en_selector: Selector::parse(".val, .b_regtxt").unwrap(),
            sentence_items_selector: Selector::parse(".se_li1").unwrap(),
            sentence_item_en_selector: Selector::parse(".sen_en").unwrap(),
            sentence_item_cn_selector: Selector::parse(".sen_cn").unwrap(),
            sentence_item_audio_selector: Selector::parse(".bdsen_audio").unwrap(),
            no_results_selector: Selector::parse(".no_results").unwrap(),
        })
    }

    fn get_text<'a, T>(&self, document: T, selector: &Selector) -> Option<String>
    where
        T: Selectable<'a>,
    {
        Some(document.select(selector).next()?.text().collect::<String>())
    }

    fn find_pronunciation(&self) -> Option<Pronunciation> {
        let phonetic_symbol = self
            .get_text(&self.document, &self.pronunciation_selector)?
            .split("[")
            .last()?
            .replace("]", "");

        let audio_url = format!(
            "{}{}",
            URL,
            self.document
                .select(&self.audio_selector)
                .next()?
                .attr("data-mp3link")?
        );

        Some(Pronunciation {
            phonetic_symbol,
            audio_url,
        })
    }

    fn find_meanings(&self) -> Option<Vec<MeaningItem>> {
        self.document.select(&self.meanings_selector).fold(
            Some(vec![]),
            |mut meaning_item, parent_element| {
                let attr = self.get_text(parent_element, &self.meaning_attr_selector)?;

                let values: Vec<MeaningValue> =
                    parent_element.select(&self.meaning_items_selector).fold(
                        Some(vec![]),
                        |mut meaning_values, child_element| -> Option<Vec<MeaningValue>> {
                            meaning_values.as_mut()?.push(MeaningValue {
                                cn: self.get_text(child_element, &self.meaning_item_cn_selector)?,
                                en: self.get_text(child_element, &self.meaning_item_en_selector)?,
                            });
                            meaning_values
                        },
                    )?;

                meaning_item.as_mut()?.push(MeaningItem { attr, values });

                meaning_item
            },
        )
    }

    fn find_sentences(&self) -> Option<Vec<SentenceItem>> {
        self.document.select(&self.sentence_items_selector).fold(
            Some(vec![]),
            |mut sentence_item, parent_element| {
                for (key, child_element) in parent_element
                    .select(&self.sentence_item_en_selector)
                    .enumerate()
                {
                    let cn = parent_element
                        .select(&self.sentence_item_cn_selector)
                        .enumerate()
                        .find(|(idx, _e)| *idx == key)?;

                    let audio = parent_element
                        .select(&self.sentence_item_audio_selector)
                        .enumerate()
                        .find(|(idx, _e)| *idx == key)?;

                    sentence_item.as_mut()?.push(SentenceItem {
                        en: strip::strip_tags(child_element.inner_html().as_str()),
                        cn: strip::strip_tags(cn.1.inner_html().as_str()),
                        audio_url: format!(
                            "{}{}",
                            URL,
                            strip::strip_tags(audio.1.attr("data-mp3link")?)
                        ),
                    });
                }
                sentence_item
            },
        )
    }

    fn has_results(&self) -> bool {
        self.document
            .select(&self.no_results_selector)
            .next()
            .is_none()
    }
}

impl Dictionary {
    pub fn new(word: &str) -> Result<Self> {
        let source = Source::new(word)?;

        if !source.has_results() {
            return Err(anyhow!("No results found for {:?}.", word));
        }

        let pronunciation = match source.find_pronunciation() {
            Some(pronunciation) => pronunciation,
            None => Pronunciation {
                phonetic_symbol: String::from(""),
                audio_url: String::from(""),
            },
        };

        let meanings = match source.find_meanings() {
            Some(meanings) => meanings,
            None => {
                vec![MeaningItem {
                    attr: String::from(""),
                    values: vec![MeaningValue {
                        cn: String::from(""),
                        en: String::from(""),
                    }],
                }]
            }
        };

        let sentences = match source.find_sentences() {
            Some(stetences) => stetences,
            None => {
                vec![SentenceItem {
                    en: String::from(""),
                    cn: String::from(""),
                    audio_url: String::from(""),
                }]
            }
        };

        Ok(Self {
            word: word.to_string(),
            pronunciation,
            meanings,
            sentences,
        })
    }

    pub fn to_json(&self) -> Result<String> {
        let serialized = serde_json::to_string(&self)?;

        Ok(serialized)
    }
}
