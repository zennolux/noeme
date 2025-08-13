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
