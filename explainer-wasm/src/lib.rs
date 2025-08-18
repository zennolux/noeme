use explainer::{Explainer, Jsonify};
use wasm_bindgen::{prelude::wasm_bindgen, JsValue};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = JSON)]
    fn parse(json_str: &str) -> JsValue;
}

#[wasm_bindgen]
pub async fn explain(word: &str) -> JsValue {
    let result = Explainer::from(word)
        .await
        .expect("Unable to load explainer")
        .to_json()
        .expect("Unable to serialize to json");

    parse(result.as_str())
}
