interface Distribution<T> {
    support(): T[];
    score(element: T): number;
}

/**Returns an array obtained by mapping the function fn over array arr. */
declare function map<T, U>(fn: (x: T) => U, arr: T[]): U[];
/**
 * Returns an array obtained by mapping the function fn over array arr. Each application of fn has an element of arr as its first argument and the index of that element as its second argument. map and mapData differ in that the use of mapData asserts to the inference back end that all executions of fn are conditionally independent. This information can potentially be exploited on a per algorithm basis to improve the efficiency of inference. mapData also provides an interface through which inference algorithms can support data sub-sampling. Where supported, the size of a “mini-batch” can be specified using the batchSize option. When using data sub-sampling the array normally returned by mapData is not computed in its entirety, so undefined is returned in its place. Only the ELBO optimization objective takes advantage of mapData at this time.
 */
declare function mapData<T, U>(opts: { data: T[], batchSize?: number }, fn: (x: T) => U): U[];
/**Returns an array obtained by mapping the function fn over arrays arr1 and arr2 concurrently. Each application of fn has an element of arr1 as its first argument and the element with the same index in arr2 as its second argument.

It is assumed that arr1 and arr2 are arrays of the same length. When this is not the case the behavior of map2 is undefined. */
declare function map2<T, U, V>(fn: (x: T, y: U) => V, arr1: T[], arr2: U[]): V[];
/**
 * Returns an array obtained by mapping the function fn over the integers [0,1,...,n-1].
 */
declare function mapN<T>(fn: (i: number) => T, n: number): T[];
/**
 * Returns the array obtained by mapping the function fn over array arr. Each application of fn has the index of the current element as its first argument and the element itself as its second argument.
 */
declare function mapIndexed<T, U>(fn: (i: number, x: T) => U, arr: T[]): U[];