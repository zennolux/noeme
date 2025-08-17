#### What's explainer?

* Its purpose is to explain a given word, including its pronunciation, meanings, and sample sentences.

* Here are two sample-result to let you quickly check if this meets your needs: like [test](https://github.com/zennolux/explainer/blob/main/samples/test.json) and [exactly](https://github.com/zennolux/explainer/blob/main/samples/exactly.json).

#### Why explainer?

* Simple to understand and easy to use.

* It's absolutely free!(No need to pay for anything, something like an API TOKEN).

#### How to use?

> ##### Using as a Rust crate

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

    //or just serialize the meanings field to json
    let meanings = explainer.meanings.to_json()?;

    //or just serialize the sentences field to json
    let sentences = explainer.sentences.to_json()?;
}
```

> ##### Using as a CLI tool 

```sh
cargo install explainer

explainer test
```
