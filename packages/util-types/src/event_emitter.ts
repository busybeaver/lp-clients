import { EventEmitter } from "events";

interface ITypedEventEmitterOpts {
  maxListener: number;
}

export class TypedEventEmitter<T> extends EventEmitter {
  public addListener<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this {
    return super.addListener(event, listener);
  }
  public on<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this {
    return super.on(event, listener);
  }
  public once<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this {
    return super.once(event, listener);
  }
  public removeListener<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this {
    return super.removeListener(event, listener);
  }
  public removeAllListeners<K extends keyof T>(event?: K): this {
    return super.removeAllListeners(event);
  }
  public listeners<K extends keyof T>(event: K): Array<(arg: T[K]) => any> {
    return super.listeners(event) as Array<(arg: T[K]) => any>;
  }
  public emit<K extends keyof T>(event: K, arg: T[K]): boolean {
    return super.emit(event, arg);
  }
  public listenerCount<K extends keyof T>(type: K): number {
    return super.listenerCount(type);
  }
  public prependListener<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this {
    return super.prependListener(event, listener);
  }
  public prependOnceListener<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this {
    return super.prependOnceListener(event, listener);
  }
}
