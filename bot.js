const tmi = require('tmi.js');
const request = require("request");
const config = require('./config');
const password = config.O_AUTH;
const clientID = config.CLIENT_ID;

// Define configuration options
const opts = {
    identity: {
        username: "Snowbottos",
        password: password
    },
    channels: [
        "snowman",
        "snowbottos"
    ]
};

// Create a client with Twitch options
const client = new tmi.client(opts);

// Register Twitch event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

function getTwitchOnlineStatus(userName) {
    const url = 'https://api.twitch.tv/kraken/streams/' + userName + '?client_id=' + clientID
    request.get(url, (error, response, body) => {
        json = JSON.parse(body);
        if (json.stream === null) {
            return console.log(userName, "is not live")
        } else {
            client.say(userName, "BIGFROG")
            return console.log(userName, "is ", json.stream.stream_type)
        }
    })
}

// Posts BIGFROG randomly between 30 to 15 minutes
// Math.floor(Math.random() * (180000000 - 900000)) + 900000;
// Math.floor(Math.random() * (5000 - 1000)) + 1000;
function frogTime() {
    let randomNumber = Math.floor(Math.random() * (180000000 - 900000)) + 900000;
    let users = opts.channels
    setTimeout(function () {
        console.log(users)
        users.forEach(function (user) {
            let cleanUserName = user.slice(1)
            getTwitchOnlineStatus(cleanUserName)
        })
    frogTime();
    }, randomNumber);
}

// RNG 1 through 12 to decided bingo row
function rollRow () {
    const rows = 12;
    return Math.floor(Math.random() * rows) + 1;
}

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
    // Ignore messages from the bot
    if (self) { return; } 

    let cleanUserName = target.slice(1)

    // Remove whitespace from chat message
    const commandName = msg.trim();


    // BIGFROG
    if (commandName === 'BIGFROG') {
        client.say(target, `BIGFROG`);
        }
    
    // Chooses bingo row
    if (commandName === '!bingo') {
        const num = rollRow();
        if (num === 1) {
            client.say(target, `Col1`);
        } else if (num === 2) {
            client.say(target, `Col2`);
        } else if (num === 3) {
            client.say(target, `Col3`);
        } else if (num === 4) {
            client.say(target, `Col4`);
        } else if (num === 5) {
            client.say(target, `Col5`);
        } else if (num === 6) {
            client.say(target, `TL-BR`);
        } else if (num === 7) {
            client.say(target, `Row1`);
        } else if (num === 8) {
            client.say(target, `Row2`);
        } else if (num === 9) {
            client.say(target, `Row3`);
        } else if (num === 10) {
            client.say(target, `Row4`);
        } else if (num === 11) {
            client.say(target, `Row5`);
        } else if (num === 12) {
            client.say(target, `BL-TR`);
        }
    }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
    frogTime();
}