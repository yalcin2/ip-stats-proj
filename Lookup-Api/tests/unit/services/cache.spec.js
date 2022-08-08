const proxyquire = require("proxyquire")
const chai = require("chai");
const sinon = require("sinon");
var sinonChai = require("sinon-chai");

const expect = chai.expect;
chai.use(sinonChai);

describe("Cache service", () => {
  let cacheService;
  let config;

  let redis;
  let redis_get = null;
  let redis_set = null;
  

  beforeEach(() => {
    config = {
      get: sinon.stub().returns("URL")
    }

    redis_get = null;
    redis_set = null;

    redis = {
      Redis: class ExchHistoryModel {
        constructor(data) {
          this.data = data;
  
        }
  
        
        get = function(ip_address) {
          return new Promise(resolve=> {
            redis_get = ip_address;
            resolve("country")
          });
        }

        set = function(ip_address, country) {
          redis_set = [ip_address, country];
        }
      }
    }

    cacheService = proxyquire(process.cwd() + "/services/cache", {
      'ioredis': redis.Redis,
    })

  });

  describe("Redis", () => { 
    it("should get a country with an ip address", () => {
      return cacheService.getCountry("ip_address").then((res) => {
        expect(res).to.eql("country");
        expect(redis_get).to.eql("ip_address");
      });
    });
    
    it("should set an ip_address as key and country as value", () => {
      cacheService.setCountry("ip_address", "country");
      expect(redis_set).eql(["ip_address", "country"])
    });

  });
});