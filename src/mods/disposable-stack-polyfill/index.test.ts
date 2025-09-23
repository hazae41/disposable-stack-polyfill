import { assert, rejects, test, throws } from "@hazae41/phobos";
import "./index.ts";

class SyncResource {

  disposed = false;

  [Symbol.dispose]() {
    this.disposed = true
  }

}

await test("sync", async ({ message, test }) => {
  const obj = new SyncResource()

  {
    using _ = obj
  }

  assert(obj.disposed)
})

class AsyncResource {

  disposed = false;

  async [Symbol.asyncDispose]() {
    this.disposed = true
  }

}

await test("async", async ({ message, test }) => {
  const obj = new AsyncResource()

  {
    await using _ = obj
  }

  assert(obj.disposed)
})

await test("defer", async () => {
  let ok = false

  {
    using stack = new DisposableStack()

    stack.defer(function (this: unknown) {
      ok = true
      assert(this === undefined, 'this is undefined')
    })
  }

  assert(ok, 'defer was called')
})

await test("async defer", async () => {
  let ok = false

  {
    await using stack = new AsyncDisposableStack()

    stack.defer(async function (this: unknown) {
      ok = true
      assert(this === undefined, 'this is undefined')
    })
  }

  assert(ok, 'defer was called')
})

await test("error", async () => {
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

await test("async error", async () => {
  let ok = false

  assert(await rejects(async () => {
    await using stack = new AsyncDisposableStack()

    stack.defer(async () => {
      throw new Error()
    })

    stack.defer(async () => {
      ok = true
    })
  }))

  assert(ok)
})

await test("use non disposable", async () => {
  let ok = false
  let after = false

  assert(throws(() => {
    using stack = new DisposableStack()

    stack.defer(() => {
      ok = true
    })

    // @ts-expect-error Should cause runtime error
    stack.use({ })

    after = true
  }))

  assert(ok, 'defer was called')
  assert(after === false, 'stack.use() did not throw')
})

await test("use non async disposable", async () => {
  let ok = false
  let after = false

  assert(await rejects(async () => {
    await using stack = new AsyncDisposableStack()

    stack.defer(async () => {
      ok = true
    })

    // @ts-expect-error Should cause runtime error
    stack.use({ })

    after = true
  }))

  assert(ok, 'defer was called')
  assert(after === false, 'stack.use() did not throw')
})
