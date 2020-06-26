export type CancellablePromise<T> = Promise<T> & { cancel: () => void }
export function makeCancellable<T>(promise: Promise<T>): CancellablePromise<T> {
  let cancelFunction: () => void = () => console.log("ERROR: Cancel Function not assigned");

  const wrappedPromise: Promise<T> = new Promise((resolve, reject) => {
    cancelFunction = () => reject({ cancelled: true });

    Promise.resolve(promise)
      .then(resolve)
      .catch(reject);
  });

  const cancellablePromise: CancellablePromise<T> = wrappedPromise as CancellablePromise<T>;
  cancellablePromise.cancel = cancelFunction;
  return cancellablePromise;
}