'use strict'

const axios = require("axios");
const Env = use('Env');

const MessageService = require("../../../services/messaging");
const CacheService = require("../../../services/cache");
const ValidationService = require("../../../services/validation");

const BASE_URL = Env.get('LOOKUP_API');

class LookupController {
    // Getting ip information through an existing api and return the country to the client
    async getIpCountry ({ request, response }) {
        try {
            // Getting data passed within the request
            const data = request.only(['ip_address'])
            const ip_address = data.ip_address;

            // Validate the ip address
            ValidationService.validateIpAddress(ip_address);

            // Check if a country already exists for the ip address.
            let country = await CacheService.getCountry(ip_address);

            // Else fetch data from the external API.
            if(!country) {
                const rawResponse = await axios.get(`${BASE_URL}${ip_address}/json/`)
                const response = rawResponse.data;
                country = response.country_name;

                // Store the country to redis with the ip address as key name
                CacheService.setCountry(ip_address, country);
            }

            // After the country is retreived, send a message to other channels that an ip search occured.
            let message = {
                id: Math.floor(Math.random() * 1000),
                searched_ip: ip_address,
                resulting_country: country,
                time_of_search: new Date().toLocaleString()
            }

            MessageService.publish(message);

            return country;
        } catch (err) {
            console.log(err)
            // Report the custom validation error back to the user.
            if(err.name === "customErrorComponent") return err.message;
            else return "Failed to retrieve information!"; // FUTURE IMPROVEMENT: Implement online error reporting for other errors.
        }
    }
}

module.exports = LookupController
