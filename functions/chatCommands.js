function chatCommands(target, context, command, client) {
    const API = require('./callAPI.js');
    const roll = require('./rollRow.js');
    const whammo = require('../lists/whammoBoard.js');

    if (command === "!checkAPI") {
        const cleanTarget = target.slice(1)
        const calledAPI = API.callAPI("https://api.twitch.tv/helix/users?login=" + cleanTarget)
        console.log(calledAPI)
    }

    if (command === "!whammoRoll") {
        const wham = whammo[roll].name
        client.say(target, wham)
    }

    if (command === "!test") {
        // client.say(target, "test")
        console.log(target)
    }

    if(command === "BIGFROG") {
        client.say(target, "BIGFROG")
    }

}

module.exports = { chatCommands };