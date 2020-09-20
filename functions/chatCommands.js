const { client } = require('tmi.js');

function chatCommands(target, context, command, client) {
    const API = require('./callAPI.js');
    const roll = require('./rollRow.js');
    const onlineStatus = require('./checkOnline.js');
    const whammo = require('../lists/whammoBoard.js');
    const asciiArt = require('../lists/asciiArt.js');

    if (command === "!checkAPI") {
        const calledAPI = API.callAPI("https://api.twitch.tv/helix/search/channels?query=" + target)
            .then(calledAPI => {
                const stringAPI = JSON.stringify(calledAPI.data[0])
                console.log(stringAPI)
            })
    }

    if (command === "!whammoRoll") {
        const wham = whammo[roll].name
        client.say(target, wham)
    }

    if (command === "!he") {
        client.say(target, asciiArt.amongus.unicode)
    }

    if (command === "!letoucan") {
        client.say(target, asciiArt.toucan.unicode)
    }

    if (command === "!shydog") {
        client.say(target, asciiArt.shydog.unicode)
    }

    if (command === "!test") {
        client.say(target, "I'm here! FrankerZ")
        console.log("posted in " + target + "'s chat")
    }

    if (command === "!checkClient") {
        console.log(client)
    }

    if (command === "!checkContext") {
        console.log(context)
    }

    if (command === "BIGFROG") {
        client.say(target, "BIGFROG")
    }

    if (command === "!checkOnline") {
        // Waits to check for online status before continuing
        // Commands needing to check online status should be wrapped in this
        (async () => {
            const online = await onlineStatus.checkOnline(target)
            console.log(online)
            if (online) {
                console.log(target + " is online")
            }
            else {
                console.log(target + " is offline")
            }
        })();
    }

}

module.exports = { chatCommands };