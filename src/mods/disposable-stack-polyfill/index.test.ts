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

  let err: any
  try {
     using stack = new DisposableStack()
     stack.use(obj1)
     stack.use(obj2)
  } catch (e) {
     err = e
  }

  assert(err instanceof Error, 'error should be an instance of Error')
  assert(err.name === 'SuppressedError', 'error should be a SuppressedError')
  assert('error' in err && err.error instanceof Error, 'main error should be an instance of Error')
  assert(err.error.message === 'dispose error 1', 'main error should be "dispose error 1"')
  assert('suppressed' in err && err.suppressed instanceof Error, 'suppressed error should be an instance of Error')
  assert(err.suppressed.message === 'dispose error 2', 'suppressed error should be "dispose error 2"')

  assert(obj1.disposed, 'obj1 should be disposed')
  assert(obj2.disposed, 'obj2 should be disposed')
})
