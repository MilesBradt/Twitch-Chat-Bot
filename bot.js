const tmi = require('tmi.js');
// const request = require("request");
const { JSDOM } = require("jsdom");
const { window } = new JSDOM('');
const document = window.document;
const $ = require("jquery")(window);
const config = require('./config');
const http = require("http");
const fs = require('fs').promises;
let indexFile;
const host = 'localhost';
const port = 8000;

fs.readFile(__dirname + "/index.html")
    .then(contents => {
        indexFile = contents;
        server.listen(port, host, () => {
            console.log(`Server is running on http://${host}:${port}`);
        });
    })
    .catch(err => {
        console.error(`Could not read index.html file: ${err}`);
        process.exit(1);
    });

const requestListener = function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(indexFile);
};

const server = http.createServer(requestListener);

const chatCommands = require('./functions/chatCommands.js');
const postHTML = require('./functions/postToHTML.js');

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
    const message = msg.trim();
    const isCommand = message.charAt(0);

    const cleanTarget = target.slice(1)
    const userName = context.username

    console.log(cleanTarget + "'s chat - " + userName + ": " + message)
    console.log(document)

    // postHTML.postToHTML(cleanTarget, userName, message)

    if (isCommand === "!") {
        chatCommands.chatCommands(cleanTarget, context, message, client);
    }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}






