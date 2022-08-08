const proxyquire = require("proxyquire")
const chai = require("chai");
const sinon = require("sinon");
var sinonChai = require("sinon-chai");

const expect = chai.expect;
chai.use(sinonChai);

describe("Messaging service", () => {
  let messagingService;
  let config;

  let database;

  let websocket;

  let amqp;
  let createChannel;
  let publish;
  let assertQueue;
  let consume;
  let close;

  beforeEach(() => {
    config = {
      get: sinon.stub().returns("URL")
    }

    global.use = sinon.stub().returns(config)

    publish = sinon.stub().returns(Promise.resolve({}));
    assertQueue = sinon.stub().returns(Promise.resolve({}));
    consume = sinon.stub()
    close = sinon.stub();

    createChannel = sinon.stub().returns(Promise.resolve({
      consume,
      prefetch: sinon.stub(),
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

    database = sinon.stub();

    websocket = sinon.stub();

    messagingService = proxyquire(process.cwd() + "/services/messaging", {
      'amqplib': amqp,
      './postgres': database,
      'ws': websocket,
    })

  });

  describe("Consume", () => { 
    it("should attach a listener", () => {
      return messagingService.consume().then(() => {
        expect(amqp.connect).callCount(1);
        expect(createChannel).callCount(1);
        expect(consume).callCount(1);
      });
    });
  });
});