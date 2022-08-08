const proxyquire = require("proxyquire")
const chai = require("chai");
const sinon = require("sinon");
var sinonChai = require("sinon-chai");

const expect = chai.expect;
chai.use(sinonChai);

describe("Postgres service", () => {
  let postgresService;
  let config;

  let pg;
  let connect;
  let end;
  let queryCommand;

  beforeEach(() => {
    config = {
      get: sinon.stub().returns("URL")
    }

    global.use = sinon.stub().returns(config)

    queryCommand = `
    DO $$
    BEGIN
        IF (NOT EXISTS (SELECT * 
                        FROM INFORMATION_SCHEMA.TABLES 
                        WHERE TABLE_SCHEMA = 'public' 
                        AND  TABLE_NAME = 'ip_information')) THEN
            CREATE TABLE public.ip_information (
            searched_ip TEXT NOT NULL,
            resulting_country TEXT NOT NULL,
            time_of_search TEXT NOT NULL
            );
        END IF;
        
        INSERT INTO public.ip_information
            (searched_ip, resulting_country, time_of_search) 
        VALUES 
            ('ip_address','country','date');
    END; 
    $$`

    connect = sinon.stub();
    query = sinon.stub().returns(Promise.resolve())
    end = sinon.stub()
    
    pg = {
      Client: class Client {
        constructor(data) {
          this.data = data;
        }

        connect = connect;
        query = query;
        end = end;
      }
    }

    postgresService = proxyquire(process.cwd() + "/services/postgres", {
      'pg': pg,
    })

  });

  describe("saveToDB", () => { 
    it("should save message received to database", (done) => {
      let message = { searched_ip:"ip_address", resulting_country:"country", time_of_search:"date" }

      postgresService.saveToDB(message);

      expect(connect).callCount(1);
      expect(query).callCount(1);
      expect(query).calledWith(queryCommand)

      setTimeout(function(){
        expect(end).callCount(1);
        done();
      })
    });

    it("should not save message if connect throws an error", (done) => {
      let message = { searched_ip:"ip_address", resulting_country:"country", time_of_search:"date" }
      connect = new Error("test");

      postgresService.saveToDB(message);

      expect(query).callCount(0);

      setTimeout(function(){
        expect(end).callCount(0);
        done();
      })
    });
  });

  describe("getAllCountries", () => { 
    it("should return all the countries", (done) => {
      queryCommand = `SELECT (resulting_country) FROM ip_information;`;
      
      query = sinon.stub().returns(Promise.resolve({ rows: [{
        resulting_country: "country1",
        field1: "test",
        field2: "test"
      },
      {
        resulting_country: "country2",
        field1: "test",
        field2: "test"
      },
      {
        resulting_country: "country3",
        field1: "test",
        field2: "test"
      },
      ]}))

      postgresService.getAllCountries().then(res => {
        expect(res).eql(['country1', 'country2', 'country3'])
        expect(connect).callCount(1);
        expect(query).callCount(1);
        expect(query).calledWith(queryCommand)
        expect(end).callCount(1);
  
        setTimeout(function(){
          expect(end).callCount(1);
          done();
        })
      })
    });
  });
});