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

await test('multiple dispose errors', async () => {
  const obj1 = {
    disposed: false,
    [Symbol.dispose]() {
      this.disposed = true
      throw new Error('dispose error 1')
    }
  }
  const obj2 = {
    disposed: false,
    [Symbol.dispose]() {
      this.disposed = true
      throw new Error('dispose error 2')
    }
  }

  let err
  try {
     using stack = new DisposableStack()
     stack.use(obj1)
     stack.use(obj2)
  } catch (e) {
     err = e
  }

  assert(err instanceof AggregateError, "should be an AggregateError")
  assert((err as AggregateError).errors.length === 2, "should contain two errors")


  assert(obj1.disposed, "obj1 should be disposed")
  assert(obj2.disposed, "obj2 should be disposed")
})
