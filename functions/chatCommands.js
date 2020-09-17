function chatCommands(target, context, command, client) {
    const API = require('./callAPI.js');
    const roll = require('./rollRow.js');
    const whammo = require('../lists/whammoBoard.js');

    if (command === "!checkAPI") {
        const cleanTarget = target.slice(1)
        const calledAPI = API.callAPI("https://api.twitch.tv/helix/search/channels?query=" + cleanTarget)
        .then(calledAPI => {
            const stringAPI = JSON.stringify(calledAPI.data[0])
            console.log(stringAPI)
        })
    }

    if (command === "!checkOnline") {
        const cleanTarget = target.slice(1)
        const calledAPI = API.callAPI("https://api.twitch.tv/helix/search/channels?query=" + cleanTarget)
        .then(calledAPI => {
            const checkIfOnline = JSON.stringify(calledAPI.data[0].is_live)
            console.log(checkIfOnline)
            if(checkIfOnline == "false") {
                console.log(cleanTarget + " is offline")
                client.say(target, cleanTarget + " is offline")
            }
            if(checkIfOnline == "true") {
                console.log(cleanTarget + " is online")
                client.say(target, cleanTarget + " is online")
            }
        })
    }

    if (command === "!whammoRoll") {
        const wham = whammo[roll].name
        client.say(target, wham)
    }

    if (command === "!test") {
        client.say(target, "I'm here! FrankerZ")
        console.log("posted in " + target + "'s chat")
    }

    if(command === "BIGFROG") {
        client.say(target, "BIGFROG")
    }
}

module.exports = { chatCommands };