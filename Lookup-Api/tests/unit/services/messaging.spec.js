const proxyquire = require("proxyquire")
const chai = require("chai");
const sinon = require("sinon");
var sinonChai = require("sinon-chai");

const expect = chai.expect;
chai.use(sinonChai);

describe("Messaging service", () => {
  let messagingService;
  let config;

  let amqp;
  let createChannel;
  let publish;
  let assertQueue;
  let close;

  beforeEach(() => {
    config = {
      get: sinon.stub().returns("URL")
    }

    global.use = sinon.stub().returns(config)

    publish = sinon.stub().returns(Promise.resolve({}));
    assertQueue = sinon.stub().returns(Promise.resolve({}));
    close = sinon.stub();

    createChannel = sinon.stub().returns(Promise.resolve({
      close,
      assertExchange: sinon.stub().returns(Promise.resolve({})),
      assertQueue,
      bindQueue: sinon.stub().returns(Promise.resolve({})),
      publish
    }))

    amqp = {
      connect: sinon.stub().returns(Promise.resolve({
        createChannel,
        close,
      }))
    }

    messagingService = proxyquire(process.cwd() + "/services/messaging", {
      'amqplib': amqp,
    })

  });

  describe("Publish", () => { 
    it("should publish a message.", () => {
      
      let message = "test"

      let messageBuffer = Buffer.from(JSON.stringify(message))

      return messagingService.publish(message).then(() => {
        expect(amqp.connect).callCount(1);
        expect(createChannel).callCount(1);
        expect(publish).callCount(1);
        expect(publish).calledWith("URL","URL", messageBuffer)
      });
    });
    
    it("should close the channel and connection", () => {
      return messagingService.publish("").then(() => {
        expect(close).callCount(2)
      });
    });

    it("should close the channel and connection even if an error is thrown", () => {
      return messagingService.publish().then(() => {
        expect(close).callCount(2)
      });
    });
  });
});