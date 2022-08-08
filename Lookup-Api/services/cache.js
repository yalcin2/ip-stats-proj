// Global imports
const Redis = require('ioredis');
const redis = new Redis();

// Get country with ip address from redis memory
function getCountry (ip_address) {
    let val = redis.get(ip_address);
    return val;
}

// Set ip address and country in redis memory
function setCountry (ip_address, country) {
    redis.set(ip_address, country);
}

// Export local functions
module.exports = {
    getCountry: getCountry,
    setCountry: setCountry,
}