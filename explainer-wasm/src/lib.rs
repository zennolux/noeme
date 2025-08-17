use explainer::{Explainer, Jsonify};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub async fn explain(word: &str) -> String {
    Explainer::from(word)
        .await
        .expect("Unable to load explainer")
        .to_json()
        .expect("Unable to serialize to json")
}
