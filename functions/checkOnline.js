async function checkOnline(target) {
    const API = require('./callAPI.js');
    try {
        const calledAPI = await API.callAPI("https://api.twitch.tv/helix/search/channels?query=" + target)
        const onlineBool = JSON.stringify(calledAPI.data[0].is_live)
        console.log("checked if " + target + " is online")
        if (onlineBool === "true") {
            return true
        }
        if (onlineBool === "false") {
            return false
        }
    }
    catch(err) {
        console.log("error calling to API");
        return "error"
    }
}

module.exports = { checkOnline };