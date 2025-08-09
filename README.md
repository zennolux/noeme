#### What's explainer?

* It plays the roles of:  `Rust crate`, `CLI tool`, and even `WebAssembly`.

* Its purpose is to explain a given word, including its pronunciation, meanings, and sample sentences.

* Here are two examples to let you quickly check if this meets your needs: like [test](https://github.com/zennolux/explainer/blob/main/examples/test.json) and [exactly](https://github.com/zennolux/explainer/blob/main/examples/exactly.json).

#### Why explainer?

* Simple to understand and easy to use.

* It's absolutely free!(No need to pay for anything, something like an API TOKEN).

#### How to use?

> ##### As a Rust crate

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

> ##### As a CLI tool 

```sh
cargo install --git https://github.com/zennolux/explainer.git

explainer test
```
