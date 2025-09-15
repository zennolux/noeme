```sh
cargo add noeme
```

```rust
use anyhow::Result;
use noeme::{Noeme,Jsonify}

#[tokio::main]
async fn main() -> Result<()> {
    //define a valid word
    let word = "exactly";

    //this will get the instance
    let noeme = Noeme::from(word).await?;

    //serialize the whole instance to json
    let result = noeme.to_json()?;

    //or just serialize the pronunciation field to json
    let pronunciation = noeme.pronunciation.to_json()?;

    //or just serialize the basic_meanings field to json
    let basic_meanings = noeme.basic_meanings.to_json()?;

    //or just serialize the advanced_meanings field to json
    let advanced_meanings = noeme.advanced_meanings.to_json()?;

    //or just serialize the sentences field to json
    let sentences = noeme.sentences.to_json()?;
}
```
