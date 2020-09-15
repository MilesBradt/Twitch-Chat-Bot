function chatCommands(command, context, client, target, callAPI) {
    const API = require('./callAPI.js');
    const roll = require('./rollRow.js');
    const whammo = require('../lists/whammoBoard.js');

    if (command === "!checkAPI") {
        const calledAPI = API.callAPI("https://api.twitch.tv/helix/users?login=" + context.username)
        console.log(calledAPI)
    }

    if (command === "!whammoRoll") {
        const wham = whammo[roll].name
        client.say(target, wham)
    }

    if (command === "!test") {
        client.say(target, "test")
    }

    if(command === "BIGFROG") {
        client.say(target, "BIGFROG")
    }

}

module.exports = { chatCommands };