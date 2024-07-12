import { Awaitable } from "libs/awaitable/index.ts"

if (typeof DisposableStack !== "function") {

  class Dispose {

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

      this.#stack.unshift(disposable)

      return disposable
    }

    adopt<T>(value: T, dispose: (value: T) => void) {
      if (this.#disposed)
        throw new ReferenceError()

      this.#stack.unshift(new Dispose(() => dispose(value)))

      return value
    }

    defer(dispose: () => void) {
      if (this.#disposed)
        throw new ReferenceError()

      this.#stack.unshift(new Dispose(dispose))

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

  class AsyncDispose {

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

      this.#stack.unshift(disposable)

      return disposable
    }

    adopt<T>(value: T, dispose: (value: T) => Awaitable<void>) {
      if (this.#disposed)
        throw new ReferenceError()

      this.#stack.unshift(new AsyncDispose(() => dispose(value)))

      return value
    }

    defer(dispose: () => Awaitable<void>) {
      if (this.#disposed)
        throw new ReferenceError()

      this.#stack.unshift(new AsyncDispose(dispose))

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