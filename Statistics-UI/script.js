
let ws = adonis.Ws("ws://localhost:3334").connect()

ws.on('open', () => {
    const result = ws.subscribe("statistics");

    result.on('message', country => {
        updateTable(country)
    });
})

let countriesArr = [];
let countryDataTable = {};

function fetchAllCountries() {
    axios.get(`http://127.0.0.1:3334/GetAllCountries`)
    .then(data => {
        countriesArr = data.data;

        updateTable();
    });
}

function updateTable(country) {
    if(country) countriesArr.push(country);

    countryDataTable = {};

    const setDataTable = () =>{
        countriesArr.forEach(country => {
            let existingVal = countryDataTable[country];
    
            if(existingVal) {
                existingVal.total = existingVal.total + 1;
            }
            else {
                countryDataTable[country] = {
                    total: 1
                }
            }
        })
    }

    const sortRecords = () => {
        const arr = Object.keys(countryDataTable).map(el => {
            return {country: el, total:countryDataTable[el].total};
         });

         arr.sort(function(a, b) {
            return a.total - b.total;
        });

        countryDataTable = arr
    }

    const setRecords= () => {
        let table = document.getElementById('info');
        table.innerHTML = "";

        for(let countryData in countryDataTable){
            let data = `<tr id="item-${countryData}">` +
                    '<td>' + countryDataTable[countryData].country + '</td>' +
                    '<td>' + countryDataTable[countryData].total + '</td>' +
                    '</tr>';

            table.innerHTML = data + table.innerHTML; 
        }
    }

    setDataTable();
    sortRecords();
    setRecords();
}

fetchAllCountries();
