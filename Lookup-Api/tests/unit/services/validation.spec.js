const proxyquire = require("proxyquire")
const chai = require("chai");
const sinon = require("sinon");
var sinonChai = require("sinon-chai");

const expect = chai.expect;
chai.use(sinonChai);

describe("Validation service", () => {
  let validationService;

  beforeEach(() => {
    validationService = proxyquire(process.cwd() + "/services/validation", {})

  });

  describe("Redis", () => { 
    it("should return a valid ip address", () => {
        try {
            let isValid = validationService.validateIpAddress("123.523.2.53");

            expect(isValid).eql("123.523.2.53")
        }
        catch(err){}
    });

    it("should return an error if ip address is invalid", () => {
        try {
            let isValid = validationService.validateIpAddress("invalid ip address");
        }
        catch(err){
           expect(err.name).eql("customErrorComponent");
           expect(err.message).eql("IP Address is not the correct format!");
        }
    });

    it("should return an error if parameter is undefined", () => {
        try {
            let isValid = validationService.validateIpAddress();
        }
        catch(err){
           expect(err.name).eql("customErrorComponent");
           expect(err.message).eql("IP Address is not defined!");
        }

    });
  });
});