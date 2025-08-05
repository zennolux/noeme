use anyhow::{anyhow, Error};
use dictionary::Dictionary;

#[test]
fn should_get_instance() {
    let word = "extremely";
    let result = Dictionary::new(word);

    assert!(result.is_ok())
}

#[test]
fn should_get_json() -> Result<(), Error> {
    let word = "extremely";
    let result = Dictionary::new(word)?.to_json();

    if let Ok(_) = result {
        Ok(())
    } else {
        Err(anyhow!("Failed to serialize dictionary to json string"))
    }
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
