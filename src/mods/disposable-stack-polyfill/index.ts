import { __addDisposableResource, __disposeResources } from 'tslib';
import { Awaitable } from "libs/awaitable/index.js"

type Env = Parameters<typeof __disposeResources>[0]

if (typeof DisposableStack !== "function") {

  class DisposableStack {

    #env: Env = { stack: [], error: undefined, hasError: false }

    #disposed = false

    constructor() { }

    get disposed() {
      return this.#disposed
    }

    [Symbol.dispose]() {
      this.dispose()
    }

    [Symbol.toStringTag]() {
      return "DisposableStack"
    }

    dispose() {
      if (this.#disposed)
        return

      this.#disposed = true

      __disposeResources(this.#env)
    }

    use<T extends Disposable>(disposable: T) {
      if (this.#disposed)
        throw new ReferenceError()

      __addDisposableResource(this.#env, disposable, false)

      return disposable
    }

    adopt<T>(value: T, dispose: (value: T) => void) {
      if (this.#disposed)
        throw new ReferenceError()

      this.#env.stack.push({ value, dispose, async: false })

      return value
    }

    defer(dispose: () => void) {
      if (this.#disposed)
        throw new ReferenceError()

      this.#env.stack.push({ dispose, async: false })

      return
    }

    move() {
      if (this.#disposed)
        throw new ReferenceError()

      const next = new DisposableStack()

      const nextEnv = next.#env
      next.#env = this.#env
      this.#env = nextEnv
      this.#disposed = true

      return next
    }

  }

  Object.defineProperty(globalThis, "DisposableStack", { value: DisposableStack })
}

if (typeof AsyncDisposableStack !== "function") {

  class AsyncDisposableStack {

    #env: Env = { stack: [], error: undefined, hasError: false }

    #disposed = false

    constructor() { }

    get disposed() {
      return this.#disposed
    }

    async [Symbol.asyncDispose]() {
      await this.disposeAsync()
    }

    [Symbol.toStringTag]() {
      return "AsyncDisposableStack"
    }

    async disposeAsync() {
      if (this.#disposed)
        return

      this.#disposed = true

      await __disposeResources(this.#env)

      return
    }

    use<T extends AsyncDisposable>(disposable: T) {
      if (this.#disposed)
        throw new ReferenceError()

      __addDisposableResource(this.#env, disposable, true)

      return disposable
    }

    adopt<T>(value: T, dispose: (value: T) => Awaitable<void>) {
      if (this.#disposed)
        throw new ReferenceError()

      this.#env.stack.push({ value, dispose, async: true })

      return value
    }

    defer(dispose: () => Awaitable<void>) {
      if (this.#disposed)
        throw new ReferenceError()

      this.#env.stack.push({ dispose, async: true })

      return
    }

    move() {
      if (this.#disposed)
        throw new ReferenceError()

      const next = new AsyncDisposableStack()

      const nextEnv = next.#env
      next.#env = this.#env
      this.#env = nextEnv
      this.#disposed = true

      return next
    }

  }

  Object.defineProperty(globalThis, "AsyncDisposableStack", { value: AsyncDisposableStack })
}