'use strict'

const DatabaseService = require("../../../services/postgres");

class StatisticsController {
        // Getting ip information through an existing api and return the country to the client
        async getAllCountries ({ request, response }) {
            try {
                // Get all the countries from the SQL Database
                let res = await DatabaseService.getAllCountries();

                return res;
            } catch (err) {
                console.log(err);
                return "Failed to retrieve information!"; // FUTURE IMPROVEMENT: Implement online error reporting for other errors.
            }
        }
}

module.exports = StatisticsController
