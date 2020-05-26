const tmi = require('tmi.js');
// const request = require("request");
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);
const config = require('./config');
const fetch = require('node-fetch');
const password = config.O_AUTH;
const auth = config.Authorization;
const clientID = config.CLIENT_ID;
const channels = config.channels;


// Define configuration options
const opts = {
    identity: {
        username: "Snowbottos",
        password: password
    },
    channels: channels
};

// Create a client with Twitch options
const client = new tmi.client(opts);

// Register Twitch event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

function checkStreamerStatus(url) {
    fetch(url, {
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

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
    let cleanTarget = target.slice(1)

    // Ignore messages from the bot
    if (self) {
        return;
    }

    // Remove whitespace from chat message
    const commandName = msg.trim();

    if (commandName === "!checkAPI") {
        console.log(checkStreamerStatus("https://api.twitch.tv/helix/users?login=snowman"))
        console.log("It got here")
    }

}






// RNG 0 through 11 to decided bingo row without repeating
function rollRow() {
    let set = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    let previousNum;
    let randNum;
    let arrayElementIndex;

    // Get a random number from predefined set
    randNum = getRndmFromSet(set);

    // Get another random number if number was the last chosen number in the set
    while (previousNum == randNum) {
        randNum = getRndmFromSet(set);
    }

    // Record the previously chosen number
    previousNum = randNum;

    arrayElementIndex = set.indexOf(randNum)

    if (set.length > 0) {
        set.splice(arrayElementIndex, 1);
    } else {
        // Reset the set
        set = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        randNum = getRndmFromSet(set);

        // Get another random number if number was the last chosen number in the set before reset
        while (previousNum == randNum) {
            randNum = getRndmFromSet(set);
        }

        previousNum = randNum;
        arrayElementIndex = set.indexOf(randNum)
        set.splice(arrayElementIndex, 1);
    }

    function getRndmFromSet(set) {
        var rndm = Math.floor(Math.random() * set.length);
        return set[rndm];
    }

    return randNum;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}