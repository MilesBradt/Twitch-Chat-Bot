const tmi = require('tmi.js');
const request = require("request");
const config = require('./config');
const password = config.O_AUTH;
const clientID = config.CLIENT_ID;
const channels = config.channels

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
    let randomNumber = Math.floor(Math.random() * (1800000 - 900000)) + 900000; 
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
    return Math.floor(Math.random() * (11 - 0)) + 0;
}

// Posts to user's chat
function postBIGFROG(userName) {
    console.log("a BIGFROG was posted in", userName);
    client.say(userName, "BIGFROG");
}

function bingoRowChooser(num, userName) {
    console.log(num)
    const bingoBoard = ["Col1", "Col2", "Col3", "Col4", "Col5", "TL-BR", "Row1", "Row2", "Row3", "Row4", "Row5", "BL-TR"]
    client.say(userName, bingoBoard[num]);
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
    postTimer();
}