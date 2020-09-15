const tmi = require('tmi.js');
// const request = require("request");
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);
const config = require('./config');

const chatCommands = require('./functions/chatCommands.js');
const callAPI = require('./functions/callAPI');

const password = config.O_AUTH;
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

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
    // Ignore messages from the bot
    if (self) {
        return;
    }

    // Remove whitespace from chat message
    const commandName = msg.trim();
    chatCommands.chatCommands(target, context, commandName, client, callAPI);
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}
