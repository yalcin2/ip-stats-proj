// Global imports
const pg = require("pg");
const Env = use('Env');

// reference - https://stackoverflow.com/questions/57109494/unable-to-connect-to-server-pgadmin-4

// Declarations
const connectionString = Env.get('DB_CONNECTION');
  
// Asynchronous function that will save the ip information message to the database
async function saveToDB(message) {
    // Split the JSON data into variables
    const { searched_ip, resulting_country, time_of_search } = message;
    // Open a new Postgres connection
    const pgClient = new pg.Client(connectionString);
    pgClient.connect();

    // Query will check if the table exists or not, if not it will create it.
    // After, it will insert the data into the table.
    var query = `
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
            ('${searched_ip}','${resulting_country}','${time_of_search}');
    END; 
    $$`;

    // Send the query and end the connection after.
    pgClient.query(query).then((res) => {
        pgClient.end();
    });
}

// Asynchronous function that return all the countries from the IP information table
async function getAllCountries() {
    return new Promise((resolve) => {
        // Open a new connection
        const pgClient = new pg.Client(connectionString);
        pgClient.connect();

        // Select only all the countries from the table
        var query = `SELECT (resulting_country) FROM ip_information;`;

        let labelsFromDb = [];

        // Send the query
        pgClient.query(query).then((res) => {
            // Clean the return result
            for (let row of res.rows) {
                labelsFromDb.push(row);
            }
            
            labelsFromDb = labelsFromDb.map(label =>{
                return label.resulting_country;
            })

            // Return the value
            resolve(labelsFromDb);
            // End the connection
            pgClient.end();
        });

    })
}

module.exports = {
    saveToDB: saveToDB,
    getAllCountries: getAllCountries
}