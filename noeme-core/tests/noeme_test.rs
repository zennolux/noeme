use noeme::{Jsonify, Noeme};

#[tokio::test]
async fn should_get_instance() {
    let word = "extremely";
    let result = Noeme::from(word).await;

    assert!(result.is_ok())
}

#[tokio::test]
async fn canbe_serialized_to_json() {
    let word = "its";
    let noeme = Noeme::from(word).await.unwrap();

    assert!(
        noeme.pronunciation.to_json().is_ok()
            && noeme.basic_meanings.to_json().is_ok()
            && noeme.advanced_meanings.to_json().is_ok()
            && noeme.sentences.to_json().is_ok()
            && noeme.to_json().is_ok()
    )
}

#[tokio::test]
#[should_panic]
async fn cannot_get_results() {
    let word = "abcijkdefguvwzyxrst";
    let result = Noeme::from(word).await;

    assert!(
        result.is_ok(),
        "No results found, ensure the word `{word}` spelled correctly.
"
    )
}
