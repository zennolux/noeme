use anyhow::Result;

use dictionary::Dictionary;

fn main() -> Result<()> {
    let word = "particular";

    let dict = Dictionary::new(word)?;

    println!("{:#?}", dict);

    Ok(())
}
