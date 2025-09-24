import { assert, rejects, test, throws } from "@hazae41/phobos";
import "./mod.ts";

class SyncResource {

  disposed = false;

  [Symbol.dispose]() {
    this.disposed = true
  }

}

test("sync", () => {
  const obj = new SyncResource()

  {
    using _ = obj
  }

  assert(obj.disposed)
})

class AsyncResource {

  disposed = false;

  // deno-lint-ignore require-await
  async [Symbol.asyncDispose]() {
    this.disposed = true
  }

}

test("async", async () => {
  const obj = new AsyncResource()

  {
    await using _ = obj
  }

  assert(obj.disposed)
})

test("defer", () => {
  let ok = false

  {
    using stack = new DisposableStack()

    stack.defer(function (this: unknown) {
      ok = true
      assert(this === undefined, "this is undefined")
    })
  }

  assert(ok, "defer was called")
})

test("async defer", async () => {
  let ok = false

  {
    await using stack = new AsyncDisposableStack()

    stack.defer(function (this: unknown) {
      ok = true
      assert(this === undefined, "this is undefined")
    })
  }

  assert(ok, "defer was called")
})

test("error", () => {
  let ok = false

  assert(throws(() => {
    using stack = new DisposableStack()

    stack.defer(() => {
      throw new Error()
    })

    stack.defer(() => {
      ok = true
    })
  }))

  assert(ok)
})

test("async error", async () => {
  let ok = false

  assert(await rejects(async () => {
    await using stack = new AsyncDisposableStack()

    stack.defer(() => {
      throw new Error()
    })

    stack.defer(() => {
      ok = true
    })
  }))

  assert(ok)
})

test("use non disposable", () => {
  let ok = false
  let after = false

  assert(throws(() => {
    using stack = new DisposableStack()

    stack.defer(() => {
      ok = true
    })

    // @ts-expect-error Should cause runtime error
    stack.use({})

    after = true
  }))

  assert(ok, "defer was called")
  assert(after === false, "stack.use() did not throw")
})

test("use non async disposable", async () => {
  let ok = false
  let after = false

  assert(await rejects(async () => {
    await using stack = new AsyncDisposableStack()

    stack.defer(() => {
      ok = true
    })

    // @ts-expect-error Should cause runtime error
    stack.use({})

    after = true
  }))

  assert(ok, "defer was called")
  assert(after === false, "stack.use() did not throw")
})
