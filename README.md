> [! WARNING]

> This project only support chinese ip to use.

> If you are't in china, or use a proxy out of china, it definitely does't work!

***

#### What's explainer?

* Its purpose is to explain a given word, including its pronunciation, meanings, and sample sentences.

* Here are two sample-result to let you quickly check if this meets your needs: like [test](https://github.com/zennolux/explainer/blob/main/sample-result/test.json) and [exactly](https://github.com/zennolux/explainer/blob/main/sample-result/exactly.json).

#### Why explainer?

* Simple to understand and easy to use.

* It's absolutely free!(No need to pay for anything, something like an API TOKEN).

#### How to use?

> ##### Using as a Rust crate

```sh
cargo add explainer
```

```rust
use explainer::{Explainer,Jsonify}

//define a valid word
let word = "exactly";

//this will get the instance
let explainer = Explainer::from(word).unwrap();

//serialize the whole instance to json
let result = explainer.to_json().unwrap();

//or just serialize the pronunciation field to json
let pronunciation = explainer.pronunciation.to_json().unwrap();

//or just serialize the meanings field to json
let meanings = explainer.meanings.to_json().unwrap();

//or just serialize the sentences field to json
let sentences = explainer.sentences.to_json().unwrap();
```

> ##### Using as a CLI tool 

```sh
cargo install explainer

explainer test
```
