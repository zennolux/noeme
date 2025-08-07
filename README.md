### What is explainer?

It's a Rust crate that can explain a wold with pronunciation, meanings, and sample sentences.
Fortunately the meanings and sample sencences both include English and Chinese version.


### Why explainer?

* Simple to understand(both source code and usage)

* Simple to use(without providing any stuff, something like an API TOKEN)


### So how to use?

```rust

use explainer::{Explainer,Jsonify}

//define a valid word
let word = "exactly";

//this will get the instance
let explainer = Explainer::new(word).unwrap();

//get the json string
let result = explainer.to_json().unwrap();

//and the fields `pronunciation`, `meanings`, `sentences` canbe sepatated and serialized to json
let pronunciation = explainer.pronunciation.to_json().unwrap();

let meanings = explainer.meanings.to_json().unwrap();

let sentences = explainer.sentences.to_json().unwrap();
```
