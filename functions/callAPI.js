const fetch = require('node-fetch');
const config = require('../config.js');
const auth = config.Authorization;
const clientID = config.CLIENT_ID;

function callAPI(url) {
    return fetch(url, {
        method: 'GET',
        headers: {
            'Client-ID': clientID,
            'Authorization': auth
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
}

module.exports = { callAPI };