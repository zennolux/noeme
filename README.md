### What's explainer?

* It can explain a given word, including its pronunciation, meanings, and sample sentences.

* It's mainly used as a `Rust crate`, but also supports `WebAssembly`.

### Why explainer?

* Simple to understand(Both source code and usage)

* Easy to use(It's just one line of code)

* It's free!(No need to pay for anything, something like an API TOKEN)


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
