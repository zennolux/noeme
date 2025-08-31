use explainer::{Explainer, Jsonify};
use wasm_bindgen::{prelude::wasm_bindgen, JsValue};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = JSON)]
    fn parse(json_str: &str) -> JsValue;
}

#[wasm_bindgen]
pub async fn explain(word: &str) -> Result<JsValue, JsValue> {
    match Explainer::from(word).await {
        Ok(explainer) => match explainer.to_json() {
            Ok(result) => Ok(parse(result.as_str())),
            Err(err) => Err(JsValue::from_str(&err.to_string())),
        },
        Err(err) => Err(JsValue::from_str(&err.to_string())),
    }
}
