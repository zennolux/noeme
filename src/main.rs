use anyhow::Result;
use biying::dictionary::Dictionary;

fn main() -> Result<()> {
    let word = "exactly";

    let dict = Dictionary::new(word)?;

    println!("{:#?}", dict);

    Ok(())
}
