use anyhow::{anyhow, Result};
use scraper::{selectable::Selectable, Html, Selector};
use serde::Serialize;
use voca_rs::strip::strip_tags;

pub trait Jsonify {
    fn to_json(&self) -> Result<String>;
}

#[derive(Debug, Serialize)]
pub struct Pronunciation {
    phonetic_symbol: String,
    audio_url: String,
}

impl Jsonify for Pronunciation {
    fn to_json(&self) -> Result<String> {
        let serialized = serde_json::to_string(&self)?;

        Ok(serialized)
    }
}

#[derive(Debug, Serialize)]
struct MeaningValue {
    cn: String,
    en: String,
}

#[derive(Debug, Serialize)]
pub struct MeaningItem {
    attr: String,
    values: Vec<MeaningValue>,
}

impl Jsonify for Vec<MeaningItem> {
    fn to_json(&self) -> Result<String> {
        let serialized = serde_json::to_string(&self)?;

        Ok(serialized)
    }
}

#[derive(Debug, Serialize)]
pub struct SentenceItem {
    en: String,
    cn: String,
    audio_url: String,
}

impl Jsonify for Vec<SentenceItem> {
    fn to_json(&self) -> Result<String> {
        let serialized = serde_json::to_string(&self)?;

        Ok(serialized)
    }
}

#[derive(Debug, Serialize)]
pub struct Explainer {
    pub word: String,
    pub pronunciation: Pronunciation,
    pub meanings: Vec<MeaningItem>,
    pub sentences: Vec<SentenceItem>,
}

impl Jsonify for Explainer {
    fn to_json(&self) -> Result<String> {
        let serialized = serde_json::to_string(&self)?;

        Ok(serialized)
    }
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

impl Source {
    const URL: &str = "https://cn.bing.com";

    #[tokio::main]
    async fn new(word: &str) -> Result<Self> {
        let url = format!("{}/dict/search?q={}", Self::URL, word);
        let html = reqwest::get(url).await?.text().await?;

        Ok(Self {
            document: Html::parse_document(html.as_str()),
            pronunciation_selector: Self::parse_selector(".hd_prUS")?,
            audio_selector: Self::parse_selector("#bigaud_us")?,
            meanings_selector: Self::parse_selector("#newLeId .each_seg")?,
            meaning_attr_selector: Self::parse_selector(".pos_lin .pos")?,
            meaning_items_selector: Self::parse_selector(".def_pa")?,
            meaning_item_cn_selector: Self::parse_selector(".bil, .b_primtxt")?,
            meaning_item_en_selector: Self::parse_selector(".val, .b_regtxt")?,
            sentence_items_selector: Self::parse_selector(".se_li1")?,
            sentence_item_en_selector: Self::parse_selector(".sen_en")?,
            sentence_item_cn_selector: Self::parse_selector(".sen_cn")?,
            sentence_item_audio_selector: Self::parse_selector(".bdsen_audio")?,
            no_results_selector: Self::parse_selector(".no_results")?,
        })
    }

    fn parse_selector(selectors: &str) -> Result<Selector> {
        if let Ok(selector) = Selector::parse(selectors) {
            Ok(selector)
        } else {
            Err(anyhow!("Unable to parse selectors {:?}", selectors))
        }
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
            Self::URL,
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
                let attr = self
                    .get_text(parent_element, &self.meaning_attr_selector)?
                    .replace(".", "");

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
                    let find = |selector: &Selector| {
                        parent_element
                            .select(selector)
                            .enumerate()
                            .find(|(idx, _e)| *idx == key)
                    };

                    let en = strip_tags(child_element.inner_html().as_str());

                    let cn = strip_tags(
                        find(&self.sentence_item_cn_selector)?
                            .1
                            .inner_html()
                            .as_str(),
                    );

                    let audio_url = format!(
                        "{}{}",
                        Self::URL,
                        strip_tags(
                            find(&self.sentence_item_audio_selector)?
                                .1
                                .attr("data-mp3link")?
                        )
                    );

                    sentence_item
                        .as_mut()?
                        .push(SentenceItem { en, cn, audio_url });
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

impl Explainer {
    /// Create explainer instance.
    ///
    /// # Examples
    /// ```
    /// use explainer::Explainer;
    ///
    /// let word = "exactly";
    /// let explainer = Explainer::from(word);
    ///
    /// assert!(explainer.is_ok());
    /// ```
    pub fn from(word: &str) -> Result<Self> {
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
}
