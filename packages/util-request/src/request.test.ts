import { get, post, request } from "./request";
import nock from "nock";

test("get functionality", async () => {
  const statusCode = 200;
  nock("http://foo.bar").get("/test").reply(statusCode);
  await expect(get("http://foo.bar/test")).resolves.toEqual(expect.objectContaining({ statusCode }));
});

test("post functionality", async () => {
  const statusCode = 200;
  nock("http://foo.bar").post("/test").reply(statusCode);
  await expect(post("http://foo.bar/test")).resolves.toEqual(expect.objectContaining({ statusCode }));
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
