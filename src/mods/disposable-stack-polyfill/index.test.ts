import { assert, test, throws } from "@hazae41/phobos";
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

await test("error", async () => {
  let ok = false

  assert(throws(() => {
    using stack = new DisposableStack()

    stack.defer(() => {
      ok = true
    })

    stack.defer(() => {
      throw new Error()
    })
  }))

  assert(ok)
})