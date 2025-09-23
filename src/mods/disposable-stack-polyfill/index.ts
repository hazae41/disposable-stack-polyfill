import { Awaitable } from "libs/awaitable/index.js"

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

      for (const disposable of this.#stack) {
        using _ = disposable
      }

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

      next.#stack = this.#stack
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

      for (const disposable of this.#stack) {
        await using _ = disposable
      }

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

      next.#stack = this.#stack
      this.#stack = new Array()
      this.#disposed = true

      return next
    }

  }

  Object.defineProperty(globalThis, "AsyncDisposableStack", { value: AsyncDisposableStack })
}