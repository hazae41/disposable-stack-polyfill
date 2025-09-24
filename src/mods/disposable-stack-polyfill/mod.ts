import type { Awaitable } from "@/libs/awaitable/mod.ts";
import type { Nullable } from "@/libs/nullable/mod.ts";
import { __addDisposableResource, __disposeResources } from "tslib";

interface State {

  // deno-lint-ignore no-explicit-any
  stack: any[];

  error: unknown;

  hasError: boolean;

}

if (typeof DisposableStack !== "function") {

  class DisposableStack {

    #state: Nullable<State> = { stack: [], error: undefined, hasError: false }

    get disposed() {
      return this.#state == null
    }

    [Symbol.dispose]() {
      this.dispose()
    }

    [Symbol.toStringTag]() {
      return "DisposableStack"
    }

    dispose(): void {
      if (this.#state == null)
        return

      const env = this.#state

      this.#state = null

      __disposeResources(env)

      return
    }

    use<T extends Disposable>(disposable: T): T {
      if (this.#state == null)
        throw new ReferenceError()

      __addDisposableResource(this.#state, disposable, false)

      return disposable
    }

    adopt<T>(value: T, dispose: (value: T) => void): T {
      const disposable = { [Symbol.dispose]: () => dispose(value) }

      this.use(disposable)

      return value
    }

    defer(dispose: () => void): void {
      const disposable = { [Symbol.dispose]: () => dispose() }

      this.use(disposable)

      return
    }

    move(): DisposableStack {
      if (this.#state == null)
        throw new ReferenceError()

      const next = new DisposableStack()

      next.#state = this.#state

      this.#state = null

      return next
    }

  }

  Object.defineProperty(globalThis, "DisposableStack", { value: DisposableStack })
}

if (typeof AsyncDisposableStack !== "function") {

  class AsyncDisposableStack {

    #state: Nullable<State> = { stack: [], error: undefined, hasError: false }

    get disposed() {
      return this.#state == null
    }

    async [Symbol.asyncDispose]() {
      await this.disposeAsync()
    }

    [Symbol.toStringTag]() {
      return "AsyncDisposableStack"
    }

    async disposeAsync(): Promise<void> {
      if (this.#state == null)
        return

      const env = this.#state

      this.#state = null

      await __disposeResources(env)

      return
    }

    use<T extends AsyncDisposable>(disposable: T): T {
      if (this.#state == null)
        throw new ReferenceError()

      __addDisposableResource(this.#state, disposable, true)

      return disposable
    }

    adopt<T>(value: T, dispose: (value: T) => Awaitable<void>): T {
      // deno-lint-ignore require-await
      const disposable = { [Symbol.asyncDispose]: async () => dispose(value) }

      this.use(disposable)

      return value
    }

    defer(dispose: () => Awaitable<void>): void {
      // deno-lint-ignore require-await
      const disposable = { [Symbol.asyncDispose]: async () => dispose() }

      this.use(disposable)

      return
    }

    move(): AsyncDisposableStack {
      if (!this.#state)
        throw new ReferenceError()

      const next = new AsyncDisposableStack()

      next.#state = this.#state

      this.#state = null

      return next
    }

  }

  Object.defineProperty(globalThis, "AsyncDisposableStack", { value: AsyncDisposableStack })
}