export type Nullable<T> = T | undefined;
export type Purify<T extends string> = { [P in T]: T; }[T];
/**
 * Make all properties of `T` optional.
 *
 * @see https://github.com/Microsoft/TypeScript/issues/15012#issuecomment-346499713
 */
export type Optional<T> = {
  [P in Purify<keyof T>]: Nullable<T[P]>;
};
