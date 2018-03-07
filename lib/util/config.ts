
// some utility functions for config objects

// TODO: can we describe the response type better (Partial isn't really correct, since it makes all values optional)?
// remove undefined and null values
export const filterUndefined = <T extends object>(obj?: T): Partial<T> => {
  return Object.entries(obj || {})
    .filter(([key, value]) => value !== undefined || value !== null)
    .reduce((filtered, [key, value]) => (filtered[key] = value, filtered), {}) as Partial<T>;
};

// only assign values that are not null or undefined and freezes the object afterwards
export const safeAssign = <T extends object, S extends object>(target: T, source?: S): void => {
  // TODO: Object.freeze(Object.assign(target, filterUndefined(source)));
  Object.assign(target, filterUndefined(source));
};

// until we have: https://github.com/Microsoft/TypeScript/pull/20075 we check it manually:
export const validateProperties = (obj?: object): void => {
  Reflect.ownKeys(obj || {})
    .forEach((key) => {
      if (!key) throw new TypeError(`The property ${key} is not initialized!`);
    });
};

export const initConfig = (config: object, input?: object) => {
  safeAssign(config, input);
  validateProperties(config);
};
