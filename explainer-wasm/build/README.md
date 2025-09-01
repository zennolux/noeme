```js
import init, { explain } from "@zennolux/explainer-wasm";

(async()=>{
  await init();  //Very important! Must initialize first.

  const explainer = await explain(word);

  console.info(explainer)
})()
```
