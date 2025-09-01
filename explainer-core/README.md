```sh
cargo add explainer
```

```rust
use anyhow::Result;
use explainer::{Explainer,Jsonify}

#[tokio::main]
async fn main() -> Result<()> {
    //define a valid word
    let word = "exactly";

    //this will get the instance
    let explainer = Explainer::from(word).await?;

    //serialize the whole instance to json
    let result = explainer.to_json()?;

    //or just serialize the pronunciation field to json
    let pronunciation = explainer.pronunciation.to_json()?;

    //or just serialize the basic_meanings field to json
    let basic_meanings = explainer.basic_meanings.to_json()?;

    //or just serialize the advanced_meanings field to json
    let advanced_meanings = explainer.advanced_meanings.to_json()?;

    //or just serialize the sentences field to json
    let sentences = explainer.sentences.to_json()?;
}
```
