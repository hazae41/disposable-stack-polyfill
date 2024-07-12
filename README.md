# DisposableStack and AsyncDisposableStack polyfill

Polyfill for `DisposableStack` and `AsyncDisposableStack`

```bash
npm i @hazae41/disposable-stack-polyfill
```

[**Node Package 📦**](https://www.npmjs.com/package/@hazae41/disposable-stack-polyfill)

## Features
- ESModules and CommonJS
- No external dependency
- Unit-tested

## Usage

### How?

ESModules 

```tsx
import "@hazae41/disposable-stack-polyfill"
```

CommonJS

```tsx
require("@hazae41/disposable-stack-polyfill")
```

### Where? 

You can import the polyfill **in your project entry file** or **in a specific file**, you just need to import it before anything that requires `DisposableStack`

(e.g. For a Next.js app, it can be in `_app.js`)

```tsx
/**
 * This polyfill at the top
 **/
import "@hazae41/disposable-stack-polyfill"

/**
 * Your imports that requires DisposableStack to work
 **/
import { a } from "a"
import { b } from "./b.js"

/**
 * Your code that requires DisposableStack to work
 **/
using x = new DisposableStack()
```
