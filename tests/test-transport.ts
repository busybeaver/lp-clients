/// <reference types="mocha" />
import { Transport, TransportEvent, ConnectionStrategies } from "../lib/connection/transport";
import { AATransport } from "../lib/connection/aatransport";

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
  it("should send a message with callback", done => {
    const transport = new Transport({
      wsUrl: "ws://demos.kaazing.com/echo"
    });
    const msg = "Hello, there!";
    transport.on(TransportEvent.ON_ERROR, err => {
      done(err);
    });
    transport.sendWithCb(err => {
      expect(err).to.be.null;
      transport.shutdown(done);
    }, msg);
  }).timeout(10000);

  it("should send a message and wait for the echo", done => {
    const transport = new Transport({
      wsUrl: "ws://demos.kaazing.com/echo" // Important! Make sure this is an echoing endpoint!
    });
    const msg = "Hello, there!";
    transport.on(TransportEvent.ON_ERROR, err => {
      done(err);
    });
    transport.on(TransportEvent.ON_MESSAGE, echo => {
      expect(echo).to.equal(msg);
      transport.shutdown(done);
    });
    transport.sendWithCb(err => {
      expect(err).to.be.null;
    }, msg);
  }).timeout(20000);
});

describe("Check statistics", () => {
  it("should get empty statistics", done => {
    const transport = new Transport({
      wsUrl: "ws://demos.kaazing.com/echo" // Important! Make sure this is an echoing endpoint!
    });
    let stats = transport.getStatistics();
    expect(stats.endpoint).to.equal("ws://demos.kaazing.com/echo");
    expect(stats.errors).to.equal(0);
    expect(stats.outbox).to.equal(0);
    expect(stats.received).to.equal(0);
    expect(stats.sent).to.equal(0);
    done();
  });
  it.skip("should check correct error counting", done => {
    done("Not implemented yet!");
  });
  it("should check correct queue and sent counting", done => {
    const transport = new Transport({
      wsUrl: "ws://demos.kaazing.com/echo", // Important! Make sure this is an echoing endpoint!
    });
    transport.pause();
    const iterations = 10;
    for (let i = 0; i < iterations; i++) {
      transport.send("Message " + i);
    }
    let stats = transport.getStatistics();
    expect(stats.endpoint).to.equal("ws://demos.kaazing.com/echo");
    expect(stats.outbox).to.equal(iterations);
    expect(stats.sent).to.equal(0);
    transport.resume();
    setTimeout(() => {
      stats = transport.getStatistics();
      expect(stats.endpoint).to.equal("ws://demos.kaazing.com/echo");
      expect(stats.outbox).to.equal(0);
      expect(stats.sent).to.equal(iterations);
      done();
    }, 2000/* wait 2 seconds */);
  }).timeout(10000);
  it("should check correct receive counting", done => {
    const transport = new Transport({
      autoConnect: false
    });
    transport.pause();
    const iterations = 10;
    for (let i = 0; i < iterations; i++) {
      transport.send("Message " + i);
    }
    let stats = transport.getStatistics();
    expect(stats.errors).to.equal(0);
    expect(stats.outbox).to.equal(iterations);
    transport.shutdown(err => {
      expect(err).to.be.null;
      setTimeout(() => {
        stats = transport.getStatistics();
        expect(stats.errors).to.equal(iterations);
        expect(stats.outbox).to.equal(0);
        done();
      }, 2000/* wait 2 seconds */);
    });
  }).timeout(10000);
});

describe("Check wrong usage", () => {
  it.skip("should check multiple connects", done => {
    done("Not implemented yet!");
  });
  it.skip("should check multiple discconnects", done => {
    done("Not implemented yet!");
  });
});

describe("Check retry/timeouts", () => {
  it.skip("should check immediate abort on 0 retries/timeout", done => {
    done("Not implemented yet!");
  });
});

describe.skip("Check ConnectionStrategies", () => {
  describe("Check ConnectionStrategy.LEAVE_OPEN_TIMEOUT", () => {});
  describe("Check ConnectionStrategy.INDEFINITE", () => {});
});

describe.skip("DEPRECATED Async send message", () => {
  it("Should send message and close the channel, leaving no event listeners", done => {
    let aclass = new AATransport({});
    aclass
      .connectAsync("ws://demos.kaazing.com/echo")
      .then(res => aclass.sendAsync("LP rulez"), rej => Promise.reject(rej))
      .then(res => aclass.disconnectAsync(), rej => Promise.reject(rej))
      .then(
        res => {
          expect(listenerCount(aclass)).to.equal(0);
          done();
        },
        rej => Promise.reject(rej)
      )
      .catch(err => {
        done(err);
      });
  });

  it("Should not be able to open the channel and fail fast", done => {
    let aclass = new AATransport({});
    aclass
      .connectAsync("ws://dem123os.kaazing.com/echo")
      .then(res => done("Err: should not get called!"), rej => done())
      .catch(err => {
        done("Err: " + err);
      });
  });

  it("Should send a message and do open/close immediately", done => {
    let aclass = new AATransport({
      connectionStrategy: ConnectionStrategies.CLOSE_IMMEDIATE
    });

    aclass
      .sendAsync("ws://demos.kaazing.com/echo")
      .then(
        res => {
          expect(listenerCount(aclass)).to.equal(0);
          done();
        },
        rej => Promise.reject(rej)
      )
      .catch(err => {
        done(err);
      });
  });
});


describe.skip("DEPRECATED Handle multiple connects", () => {
  let t;
  it("should kill the old ws connection on calling connect again", done => {
    let closeCount = 10;
    t = new Transport({});
    for (let i = closeCount; i > 0; i--) {
      t.on(t.Event.ON_CLOSED, (code, reason) => {
        expect(code).to.equal(1000); // Normal shutdown
        closeCount--;
      });
      t.on(t.Event.ON_MESSAGE, rawMsg => {
        t.disconnect();
      });
      t.on(t.Event.ON_CONNECTED, () => {
        t.send("Test " + i, err => {
          expect(err).to.be.null;
        });
      });
      t.connect("ws://demos.kaazing.com/echo");
    }

    expect(closeCount).to.equal(0);

    done("Not implemented yet!");
  });
  /*it("should NOT kill the old ws connection on calling connect again", done => {
        let closeCount = 10;
        t = new Transport({
            connectionStrategy: ConnectionStrategies.LEAVE_OPEN
        });
        for (let i = closeCount; i > 0; i--) {
            t.on(t.Event.ON_CLOSED, (code, reason) => {
                expect(code).to.equal(1000); // Normal shutdown
                closeCount--;
            })
            t.on(t.Event.ON_CONNECTED, () => {
                t.send("Test " + i, err => {
                    expect(err).to.be.null;
                    t.disconnect();
                });
            })
            t.connect("ws://demos.kaazing.com/echo");
        }

        expect(closeCount).to.equal(0);

        done("Not implemented yet!");
    })*/
});
