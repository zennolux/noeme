use explainer::{Explainer, Jsonify};

#[test]
fn should_get_instance() {
    let word = "extremely";
    let result = Explainer::from(word);

    assert!(result.is_ok())
}

#[test]
fn canbe_serialized_to_json() {
    let word = "extremely";
    let explainer = Explainer::from(word).unwrap();

    assert!(
        explainer.pronunciation.to_json().is_ok()
            && explainer.meanings.to_json().is_ok()
            && explainer.sentences.to_json().is_ok()
            && explainer.to_json().is_ok()
    )
}

#[test]
#[should_panic]
fn cannot_get_results() {
    let word = "abcijkdefguvwzyxrst";
    let result = Explainer::from(word);

    assert!(
        result.is_ok(),
        "No results found, ensure the word `{word}` spelled correctly.
"
    )
}
