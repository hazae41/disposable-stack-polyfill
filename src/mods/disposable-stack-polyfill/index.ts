import { __addDisposableResource, __disposeResources } from 'tslib';
import { Awaitable } from "libs/awaitable/index.js"

type Env = Parameters<typeof __disposeResources>[0]

if (typeof DisposableStack !== "function") {

  class DisposableStack {

    #env: null | Env = { stack: [], error: undefined, hasError: false }

    get disposed() {
      return this.#env === null
    }

    [Symbol.dispose]() {
      this.dispose()
    }

    [Symbol.toStringTag]() {
      return "DisposableStack"
    }

    dispose(): void {
      if (!this.#env)
        return

      const env = this.#env
      this.#env = null

      __disposeResources(env)

      return
    }

    use<T extends Disposable>(disposable: T): T {
      if (!this.#env)
        throw new ReferenceError()

      __addDisposableResource(this.#env, disposable, false)

      return disposable
    }

    adopt<T>(value: T, dispose: (value: T) => void): T {
      this.use({
        [Symbol.dispose]: dispose.bind(undefined, value)
      })

      return value
    }

    defer(dispose: () => void): void {
      this.use({
        [Symbol.dispose]: dispose.bind(undefined)
      })

      return
    }

    move(): DisposableStack {
      if (!this.#env)
        throw new ReferenceError()

      const next = new DisposableStack()

      next.#env = this.#env
      this.#env = null

      return next
    }

  }

  Object.defineProperty(globalThis, "DisposableStack", { value: DisposableStack })
}

if (typeof AsyncDisposableStack !== "function") {

  class AsyncDisposableStack {

    #env: null | Env = { stack: [], error: undefined, hasError: false }

    get disposed() {
      return this.#env === null
    }

    async [Symbol.asyncDispose]() {
      await this.disposeAsync()
    }

    [Symbol.toStringTag]() {
      return "AsyncDisposableStack"
    }

    async disposeAsync(): Promise<void> {
      if (!this.#env)
        return

      const env = this.#env
      this.#env = null

      await __disposeResources(env)

      return
    }

    use<T extends AsyncDisposable>(disposable: T): T {
      if (!this.#env)
        throw new ReferenceError()

      __addDisposableResource(this.#env, disposable, true)

      return disposable
    }

    adopt<T>(value: T, dispose: (value: T) => Awaitable<void>): T {
      this.use({
        [Symbol.asyncDispose]: async () => dispose(value)
      })

      return value
    }

    defer(dispose: () => Awaitable<void>): void {
      this.use({
        [Symbol.asyncDispose]: async () => dispose()
      })

      return
    }

    move(): AsyncDisposableStack {
      if (!this.#env)
        throw new ReferenceError()

      const next = new AsyncDisposableStack()

      next.#env = this.#env
      this.#env = null

      return next
    }

  }

  Object.defineProperty(globalThis, "AsyncDisposableStack", { value: AsyncDisposableStack })
}