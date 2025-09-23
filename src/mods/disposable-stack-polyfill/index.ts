import { __addDisposableResource, __disposeResources } from 'tslib';
import { Awaitable } from "libs/awaitable/index.js"

type DisposeResourcesEnv = Parameters<typeof __disposeResources>[0]

if (typeof DisposableStack !== "function") {

  class AsyncDeferred {

    constructor(
      readonly dispose: () => void
    ) { }

    [Symbol.dispose]() {
      this.dispose()
    }

  }

  class DisposableStack {

    #stack = new Array<Disposable>()

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

      const env: DisposeResourcesEnv = {
        stack: [],
        error: undefined,
        hasError: false
      }

      for (const disposable of this.#stack) {
        __addDisposableResource(env, disposable, false)
      }

      __disposeResources(env)

      return
    }

    use<T extends Disposable>(disposable: T) {
      if (this.#disposed)
        throw new ReferenceError()

      this.#stack.push(disposable)

      return disposable
    }

    adopt<T>(value: T, dispose: (value: T) => void) {
      if (this.#disposed)
        throw new ReferenceError()

      this.#stack.push(new AsyncDeferred(() => dispose(value)))

      return value
    }

    defer(dispose: () => void) {
      if (this.#disposed)
        throw new ReferenceError()

      this.#stack.push(new AsyncDeferred(dispose))

      return
    }

    move() {
      if (this.#disposed)
        throw new ReferenceError()

      const next = new DisposableStack()

      for (const disposable of this.#stack) {
        next.use(disposable)
      }

      this.#stack = new Array()
      this.#disposed = true

      return next
    }

  }

  Object.defineProperty(globalThis, "DisposableStack", { value: DisposableStack })
}

if (typeof AsyncDisposableStack !== "function") {

  class AsyncDeferred {

    constructor(
      readonly dispose: () => Awaitable<void>
    ) { }

    async [Symbol.asyncDispose]() {
      await this.dispose()
    }

  }

  class AsyncDisposableStack {

    #stack = new Array<AsyncDisposable>()

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

      const env: DisposeResourcesEnv = {
        stack: [],
        error: undefined,
        hasError: false
      }

      for (const disposable of this.#stack) {
        __addDisposableResource(env, disposable, true)
      }

      await __disposeResources(env)

      return
    }

    use<T extends AsyncDisposable>(disposable: T) {
      if (this.#disposed)
        throw new ReferenceError()

      this.#stack.push(disposable)

      return disposable
    }

    adopt<T>(value: T, dispose: (value: T) => Awaitable<void>) {
      if (this.#disposed)
        throw new ReferenceError()

      this.#stack.push(new AsyncDeferred(() => dispose(value)))

      return value
    }

    defer(dispose: () => Awaitable<void>) {
      if (this.#disposed)
        throw new ReferenceError()

      this.#stack.push(new AsyncDeferred(dispose))

      return
    }

    move() {
      if (this.#disposed)
        throw new ReferenceError()

      const next = new AsyncDisposableStack()

      for (const disposable of this.#stack) {
        next.use(disposable)
      }

      this.#stack = new Array()
      this.#disposed = true

      return next
    }

  }

  Object.defineProperty(globalThis, "AsyncDisposableStack", { value: AsyncDisposableStack })
}
