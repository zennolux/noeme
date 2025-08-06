use dictionary::{Dictionary, Jsonify};

#[test]
fn should_get_instance() {
    let word = "extremely";
    let result = Dictionary::new(word);

    assert!(result.is_ok())
}

#[test]
fn specific_items_and_itself_canbe_serialized_to_json() {
    let word = "extremely";
    let dict = Dictionary::new(word).unwrap();

    assert!(
        dict.pronunciation.to_json().is_ok()
            && dict.meanings.to_json().is_ok()
            && dict.sentences.to_json().is_ok()
            && dict.to_json().is_ok()
    )
}

#[test]
#[should_panic]
fn cannot_get_results() {
    let word = "abcijkdefguvwzyxrst";
    let result = Dictionary::new(word);

    assert!(
        result.is_ok(),
        "No results found, ensure the word `{word}` spelled correctly.
"
    )
}
