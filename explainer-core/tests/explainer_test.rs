use explainer::{Explainer, Jsonify};

#[tokio::test]
async fn should_get_instance() {
    let word = "extremely";
    let result = Explainer::from(word).await;

    assert!(result.is_ok())
}

#[tokio::test]
async fn canbe_serialized_to_json() {
    let word = "its";
    let explainer = Explainer::from(word).await.unwrap();

    println!("{:#?}", explainer.advanced_meanings);

    assert!(
        explainer.pronunciation.to_json().is_ok()
            && explainer.advanced_meanings.to_json().is_ok()
            && explainer.sentences.to_json().is_ok()
            && explainer.to_json().is_ok()
    )
}

#[tokio::test]
#[should_panic]
async fn cannot_get_results() {
    let word = "abcijkdefguvwzyxrst";
    let result = Explainer::from(word).await;

    assert!(
        result.is_ok(),
        "No results found, ensure the word `{word}` spelled correctly.
"
    )
}
