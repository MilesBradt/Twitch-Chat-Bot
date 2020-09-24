function postToHTML(cleanTarget, userName, message) {

    // var element = window.document.getElementById('chat');
    // element.appendChild(cleanTarget + "'s chat - " + userName + ": " + message)
    $("#chat").append(cleanTarget + "'s chat - " + userName + ": " + message)

}

module.exports = { postToHTML };
