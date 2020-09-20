const callAPI = require('./callAPI.js');

async function checkOnline(target, client) {
    const API = require('./callAPI.js');
    const cleanTarget = target.slice(1)
    try {
        const calledAPI = await API.callAPI("https://api.twitch.tv/helix/search/channels?query=" + cleanTarget)
        const onlineBool = JSON.stringify(calledAPI.data[0].is_live)
        console.log(onlineBool)
        if(onlineBool === "false") {
            console.log(cleanTarget + " is offline")
            client.say(target, cleanTarget + " is offline")
            return onlineBool
        }
        if(onlineBool === "true") {
             console.log(cleanTarget + " is online")
            client.say(target, cleanTarget + " is online")
            return onlineBool
        }
    }
    catch(err) {
        console.log("error calling to API");
        return "error"
    }
}

module.exports = { checkOnline };