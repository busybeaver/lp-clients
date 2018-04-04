import { get, post, request } from "./request";
import nock from "nock";

const checkFunctionality = async (fn, nockFnName) => {
  const statusCode = 200;
  nock("http://foo.bar")[nockFnName]("/test").reply(statusCode);
  await expect(fn("http://foo.bar/test")).resolves.toEqual(expect.objectContaining({ statusCode }));
};

test("get functionality", async () => {
  expect.hasAssertions();
  await checkFunctionality(get, "get");
});

test("post functionality", async () => {
  expect.hasAssertions();
  await checkFunctionality(post, "post");
});

test("request functionality (retry with second request success)", async () => {
  const body = { foo: "bar" };
  const statusCode = 200;
  nock("http://foo.bar").get("/test").reply(503);
  nock("http://foo.bar").get("/test").reply(statusCode, body);
  await expect(request("http://foo.bar/test", { method: "get" })).resolves.toEqual(expect.objectContaining({ statusCode, body }));
});

test("request functionality (retry no success)", async () => {
  const body1 = { error: "test error" };
  const statusCode = 503;
  nock("http://foo.bar").get("/test").times(2).reply(statusCode, body1);
  await expect(request("http://foo.bar/test", { method: "get" })).rejects.toThrowError("test error");
  const body2 = { foo: "bar" };
  nock("http://foo.bar").get("/test").times(2).reply(statusCode, body2);
  await expect(request("http://foo.bar/test", { method: "get" })).rejects.toThrowError();
});
