// Regex to test if IP Address is valid or not
const ipValReg = new RegExp(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)

function validateIpAddress (ip_address) {
    let error;

    // Create a custom error to be returned to the user for additional information.
    const createError = (err) => {
        error = new Error(err);
        error.name = "customErrorComponent"
    }

    // Validate the ip address and throw an error if an issue is found
    if(!ip_address){
        createError("IP Address is not defined!");
    }
    else if (!ipValReg.test(ip_address)) {
        createError("IP Address is not the correct format!");
    }

    if(error) throw error;

    return ip_address;
}

module.exports = {
    validateIpAddress: validateIpAddress,
}