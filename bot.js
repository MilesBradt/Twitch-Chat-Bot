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

// Checks if user is online before posting emotes
function checkStreamerOnlineStatusToPostBIGFROG(userName) {
    const url = 'https://api.twitch.tv/kraken/streams/' + userName + '?client_id=' + clientID
    request.get(url, (error, response, body) => {
        json = JSON.parse(body);
        if (json.stream === null) {
            return console.log(userName, "is not live")
        } else {
            postBIGFROG(userName)
            return console.log(userName, "is ", json.stream.stream_type)
        }
    })
}

// Posts something randomly between 30 to 15 minutes
function postTimer() {
    // Use for faster testing
    // Math.floor(Math.random() * (5000 - 1000)) + 1000; 
    let randomNumber = Math.floor(Math.random() * (180000000 - 900000)) + 900000; 
    let users = opts.channels
    setTimeout(function () {
        console.log(users)
        users.forEach(function (user) {
            let cleanUserName = user.slice(1)
            checkStreamerOnlineStatusToPostBIGFROG(cleanUserName)
        })
        postTimer();
    }, randomNumber);
}

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
    // Ignore messages from the bot
    if (self) { return; } 
    
    // Remove whitespace from chat message
    const commandName = msg.trim();
    
    // BIGFROG
    if (commandName === 'BIGFROG') {
        postBIGFROG(target)
    }
    
    // Chooses bingo row
    if (commandName === '!bingo' || commandName === '!row' || commandName === '!col') {
        const num = rollRow();
        bingoRowChooser(num, target)
    }
}

// RNG 1 through 12 to decided bingo row
function rollRow () {
    const rows = 12;
    return Math.floor(Math.random() * rows) + 1;
}

// Posts to user's chat
function postBIGFROG(userName) {
    client.say(userName, "BIGFROG")
}

function bingoRowChooser(num, userName) {
    if (num === 1) {
        client.say(userName, `Col1`);
    } else if (num === 2) {
        client.say(userName, `Col2`);
    } else if (num === 3) {
        client.say(userName, `Col3`);
    } else if (num === 4) {
        client.say(userName, `Col4`);
    } else if (num === 5) {
        client.say(userName, `Col5`);
    } else if (num === 6) {
        client.say(userName, `TL-BR`);
    } else if (num === 7) {
        client.say(userName, `Row1`);
    } else if (num === 8) {
        client.say(userName, `Row2`);
    } else if (num === 9) {
        client.say(userName, `Row3`);
    } else if (num === 10) {
        client.say(userName, `Row4`);
    } else if (num === 11) {
        client.say(userName, `Row5`);
    } else if (num === 12) {
        client.say(userName, `BL-TR`);
    }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
    postTimer();
}