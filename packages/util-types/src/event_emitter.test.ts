/// <reference types="expect-more-jest" />
import { TypedEventEmitter } from "./event_emitter";
import { EventEmitter } from "events";
import { emit } from "cluster";

test("init TypedEventEmitter", () => {
  const emitter = new TypedEventEmitter();
  expect(emitter).toBeInstanceOf(TypedEventEmitter);
  expect(emitter).toBeInstanceOf(EventEmitter);
});

test("TypedEventEmitter functionality", () => {
  interface IMapping {
    [type: string]: string;
  }
  const emitter = new TypedEventEmitter<IMapping>();
  const fn = jest.fn();
  emitter.addListener("foo", fn);
  emitter.emit("foo", "bar");
  expect(fn).toHaveBeenCalledTimes(1);
  expect(emitter.listenerCount("foo")).toBe(1);
  expect(emitter.listenerCount("123")).toBe(0);
  emitter.removeListener("foo", fn);
  expect(emitter.listenerCount("foo")).toBe(0);
  emitter.once("foo", fn);
  emitter.prependOnceListener("foo", fn);
  emitter.emit("foo", "bar");
  emitter.emit("foo", "bar");
  emitter.emit("foo", "bar"); // will not trigger the listener
  expect(fn).toHaveBeenCalledTimes(3);
  expect(emitter.listenerCount("foo")).toBe(0);
  expect(emitter.listeners("foo")).toBeArrayOfSize(0);
  emitter.addListener("foo", fn);
  expect(emitter.listeners("foo")).toBeArrayOfSize(1);
  emitter.removeAllListeners("foo");
  expect(emitter.listeners("foo")).toBeArrayOfSize(0);
});
