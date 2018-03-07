/// <reference types="mocha" />

import { UMSTransport } from "../lib/connection/umstransport";
import { TransportEvent, TransportConfig } from "../lib/connection/transport";
import * as chai from "chai";
const expect = chai.expect;

/**
 * Returns the listener count on a given emitter. Used to verify a correct cleanup.
 */
const listenerCount = e => {
  const evts = e.eventNames();
  let count = 0;
  for (let ei = 0; ei < evts.length; ei++) {
    count += e.listenerCount(evts[ei]);
  }
  return count;
};

describe("Check default usage", () => {
  it("should send a message with promise", done => {
    const transport = new UMSTransport({
      wsUrl: "ws://demos.kaazing.com/echo"
    });
    const msg = "Hello, there!";
    transport
      .sendWPromise(msg)
      .then(done)
      .catch(err => {
        done("Err: " + err);
      });
  }).timeout(10000);

  it("should send a message and wait for the echo", done => {
    const transport = new UMSTransport({
      wsUrl: "ws://demos.kaazing.com/echo" 
    });
    const msg = "Hello, there!";
    transport.on(TransportEvent.ON_ERROR, err => {
      done(err);
    });
    transport.on(TransportEvent.ON_MESSAGE, echo => {
      expect(echo).to.equal(msg);
      transport.shutdown(done);
    });
    transport
      .sendWPromise(msg)
      .catch(err => {
        done("Err: " + err);
      });
  }).timeout(20000);
});
