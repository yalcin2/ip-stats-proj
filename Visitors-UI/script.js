function fetchCountryWithIp() {
    const ipAddressInput = document.getElementById("ipAddressInput").value 

    axios.get(`http://127.0.0.1:3333/Lookup?ip_address=${ipAddressInput}`)
    .then(data => setElement("countryForIp", data.data));
}

function getUserIpAddress() {
    axios.get("https://ipecho.net/plain")
    .then(data => {
        setElement("ipAddressInput", data.data);
    });
}

function setElement(elementId, value){
    document.getElementById(elementId).value = value
    document.getElementById(elementId).innerHTML = value
}

getUserIpAddress();

