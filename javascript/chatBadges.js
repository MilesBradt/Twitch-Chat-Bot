function getTwitchAPI(url) {
    return $.getJSON(url + (url.indexOf('?') > -1 ? '&' : '?') + "client_id=ktal92w3ex61borirsmsncyyv2rijo");
}

Chat = {
    clearChat: function(nick) {
        $('.chat_line[data-nick='+nick+']').remove();
    },
    clearMessage: function(id) {
        $('.chat_line[data-id='+id+']').remove();
    },
    escape: function(message) {
        return message.replace(/</g,'&lt;').replace(/>/g, '&gt;');
    },
    extraEmoteTemplate: function(emote) {
        return '<img class="emoticon ' + emote.source + '-emo-' + emote.id + '" src="' + emote['1x'] + '" srcset="' + emote['2x'] + ' 2x, ' + emote['3x'] + ' 4x" />';
    },
    emoteTemplate: function(id) {
        return '<img class="emoticon ttv-emo-' + id + '" src="//static-cdn.jtvnw.net/emoticons/v1/' + id + '/1.0" srcset="//static-cdn.jtvnw.net/emoticons/v1/' + id + '/2.0 2x, //static-cdn.jtvnw.net/emoticons/v1/' + id + '/3.0 4x" />';
    },
    cheerTemplate: function(url) {
        return '<img class="emoticon cheermote" src="' + url + '" />';
    },
    emoticonize: function(message, emotes) {
        if(!emotes) return [message];

        var tokenizedMessage = [];

        var emotesList = Object.keys(emotes);

        var replacements = [];

        emotesList.forEach(function(id) {
            var emote = emotes[id];

            for(var i=emote.length-1; i>=0; i--) {
                replacements.push({ id: id, first: emote[i][0], last: emote[i][1] });
            }
        });

        replacements.sort(function(a, b) {
            return b.first - a.first;
        });

        // Tokenizes each character into an array
        // punycode deals with unicode symbols on surrogate pairs
        // punycode is used in the replacements loop below as well
        message = punycode.ucs2.decode(message);

        replacements.forEach(function(replacement) {
            // Unshift the end of the message (that doesn't contain the emote)
            tokenizedMessage.unshift(punycode.ucs2.encode(message.slice(replacement.last+1)));

            // Unshift the emote HTML (but not as a string to allow us to process links and escape html still)
            tokenizedMessage.unshift([ Chat.emoteTemplate(replacement.id) ]);

            // Splice the unparsed piece of the message
            message = message.slice(0, replacement.first);
        });

        // Unshift the remaining part of the message (that contains no emotes)
        tokenizedMessage.unshift(punycode.ucs2.encode(message));

        return tokenizedMessage;
    },
    extraEmoticonize: function(sender, message, emote) {
        if(emote.restrictions) {
            if(emote.restrictions.channels && emote.restrictions.channels.length && emote.restrictions.channels.indexOf(Chat.vars.channel) === -1) return message;

            if(emote.restrictions.games && emote.restrictions.games.length) return message;
        }

        return message.replace(emote.code, Chat.extraEmoteTemplate(emote));
    },
    getCheer: function(prefix, amount) {
        var amounts = Chat.vars.cheers[prefix];
        return amounts[
            Object.keys(amounts)
                .sort(function(a, b) {
                    return parseInt(b, 10) - parseInt(a, 10);
                })
                .find(function(a) {
                    return amount >= a;
                })
        ];
    },
    findCheerInToken: function(sender, token) {
        if (!sender.bits) return null;
        var cheerPrefixes = Object.keys(Chat.vars.cheers);
        var tokenLower = token.toLowerCase();
        for (var i = 0; i < cheerPrefixes.length; i++) {
            var prefixLower = cheerPrefixes[i].toLowerCase();
            if (tokenLower.startsWith(prefixLower)) {
                var amount = parseInt(tokenLower.substr(prefixLower.length), 10);
                return Chat.getCheer(cheerPrefixes[i], amount);
            }
        }
        return null;
    },
    extraMessageTokenize: function(sender, message) {
        var tokenizedString = message.split(' ');

        for(var i=0; i<tokenizedString.length; i++) {
            var piece = tokenizedString[i];

            var test = piece.replace(/(^[~!@#$%\^&\*\(\)]+|[~!@#$%\^&\*\(\)]+$)/g, '');
            var emote = Chat.vars.extraEmotes[test] || Chat.vars.extraEmotes[piece];
            if (!emote && Chat.vars.proEmotes[sender.name] !== undefined) {
                emote = Chat.vars.proEmotes[sender.name][test] || Chat.vars.proEmotes[sender.name][piece];
            }

            var cheer = Chat.findCheerInToken(sender, piece);
            
            if(cheer) {
                piece = Chat.cheerTemplate(cheer);
            } else if(emote) {
                piece = Chat.extraEmoticonize(sender, piece, emote);
            } else {
                piece = Chat.escape(piece);
            }

            tokenizedString[i] = piece;
        }

        return tokenizedString.join(' ');
    },
    insert: function(nick, tags, message) {
        var nick = nick || "Chat",
            userData = userData || {},
            message = message || "",
            action = action || false,
            messageId = tags && tags.id;

        tags = tags ? Chat.parseTags(nick, tags) : {};

        if(/^\x01ACTION.*\x01$/.test(message)) {
            action = true;
            message = message.replace(/^\x01ACTION/, '').replace(/\x01$/, '').trim();
        }

        var $newLine = $('<div></div>');
        $newLine.addClass('chat_line');
        $newLine.attr('data-id', messageId);
        $newLine.attr('data-nick', nick);
        $newLine.attr('data-user-type', tags.userType);
        $newLine.attr('data-timestamp', Date.now());

        var $time = $('<span></span>');
        $time.addClass('time_stamp')
        $time.text(new Date().toLocaleTimeString().replace(/^(\d{0,2}):(\d{0,2}):(.*)$/i, '$1:$2'));
        $newLine.append($time);

        if(tags.badges) {
            var $tags = $('<span></span>');
            tags.badges.forEach(function(badge) {
                var $tag = $('<img/>');
                $tag.addClass(badge.type + '-' + badge.version);
                $tag.addClass('tag');
                $tag.attr('src', Chat.vars.badges[badge.type + ':' + badge.version]);
                $tags.append($tag);
            });
            $newLine.append($tags);
        }

        if(
            (!Chat.vars.themeNameCC && Chat.vars.style !== 'clear') ||
            (Chat.vars.themeNameCC && Chat.vars.themeNameCC.enabled)
        ) {
            var bg = (Chat.vars.style !== 'clear') ? Chat.vars.style : Chat.vars.themeNameCC.kind;

            if(/^#[0-9a-f]+$/i.test(tags.color)) {
                while(calculateColorBackground(tags.color) !== bg) {
                    tags.color = calculateColorReplacement(tags.color, calculateColorBackground(tags.color));
                }
            }
        }

        var $formattedUser = $('<span></span>');
        $formattedUser.addClass('nick');
        $formattedUser.css('color', tags.color);
        $formattedUser.html(tags.displayName ? tags.displayName : nick);
        $newLine.append($formattedUser);
        action ? $newLine.append('&nbsp;') : $newLine.append('<span class="colon">:</span>&nbsp;');

        var $formattedMessage = $('<span></span>');
        $formattedMessage.addClass('message');
        if(action) $formattedMessage.css('color', tags.color);

        var emotes = {};

        if(tags.emotes) {
            tags.emotes = tags.emotes.split('/');

            tags.emotes.forEach(function(emote) {
                emote = emote.split(':');

                if(!emotes[emote[0]]) emotes[emote[0]] = [];

                var replacements = emote[1].split(',');
                replacements.forEach(function(replacement) {
                    replacement = replacement.split('-');

                    emotes[emote[0]].push([ parseInt(replacement[0]) , parseInt(replacement[1]) ]);
                });
            });
        }

        var tokenizedMessage = Chat.emoticonize(message, emotes);

        for(var i=0; i<tokenizedMessage.length; i++) {
            if(typeof tokenizedMessage[i] === 'string') {
                tokenizedMessage[i] = Chat.extraMessageTokenize(tags, tokenizedMessage[i]);
            } else {
                tokenizedMessage[i] = tokenizedMessage[i][0];
            }
        }

        message = tokenizedMessage.join(' ');
        message = twemoji.parse(message);

        $formattedMessage.html(message);
        $newLine.append($formattedMessage);

        Chat.vars.queue.push($newLine.wrap('<div>').parent().html());
    },
    load: function(channel) {
        Chat.vars.channel = channel;

        if(Chat.vars.theme) {
            Chat.loadTheme(Chat.vars.theme);
        } else {
            $('#chat_box').attr('class', Chat.vars.style);
        }

        if(Chat.vars.preventClipping) {
            Chat.vars.max_height = $(window).height();
        } else {
            $('#chat_box').css('height', 'calc(100% - 10px)');
        }

        Chat.loadEmotes(function() {
            Chat.loadGlobalBadges(function() {
                Chat.loadCheers();
                Chat.insert(null, null, "Connecting to chat server..");

                var socket = new ReconnectingWebSocket('wss://irc-ws.chat.twitch.tv', 'irc', { reconnectInterval: 3000 });

                socket.onopen = function(data) {
                    Chat.insert(null, null, "Connected.");
                    socket.send('PASS blah\r\n');
                    socket.send('NICK justinfan12345\r\n');
                    socket.send('CAP REQ :twitch.tv/commands twitch.tv/tags\r\n');
                    socket.send('JOIN #' + Chat.vars.channel + '\r\n');
                };

                socket.onclose = function() {
                    Chat.insert(null, null, "You were disconnected from the server.");
                };

                socket.onmessage = function(data) {
                    var message = window.parseIRC(data.data.trim());

                    if(!message.command) return;

                    switch(message.command) {
                        case "PING":
                            socket.send('PONG ' + message.params[0]);
                            return;
                        case "JOIN":
                            Chat.insert(null, null, "Joined channel: "+Chat.vars.channel+".");
                            return;
                        case "CLEARCHAT":
                            if(message.params[1]) Chat.clearChat(message.params[1]);
                            return;
                        case "CLEARMSG":
                            var messageId = message.tags ? message.tags['target-msg-id'] : null;
                            if (messageId) {
                                Chat.clearMessage(messageId);
                            }
                            return;
                        case "PRIVMSG":
                            if(message.params[0] !== '#' + channel || !message.params[1]) return;

                            var nick = message.prefix.split('@')[0].split('!')[0];

                            if(getParameterByName('bot_activity').toLowerCase() !== 'true') {
                                if(message.params[1].charAt(0) === '!') return;
                                if(/bot$/.test(nick)) return;
                            }

                            if (Chat.vars.spammers.indexOf(nick) > -1) return;

                            Chat.insert(nick, message.tags, message.params[1]);
                            return;
                    }
                };

                Chat.vars.socket = socket;


                var bttvSocket = new ReconnectingWebSocket('wss://sockets.betterttv.net/ws', null, { reconnectInterval: 3000 });

                bttvSocket.emit = function(evt, data) {
                    this.send(JSON.stringify({
                        name: evt,
                        data: data
                    }));
                }

                bttvSocket.events = {};
                bttvSocket.events.new_spammer = function(data) {
                    console.log('Added ' + data.name + 'as a spammer');
                    Chat.vars.spammers.push(data.name);
                    Chat.clearChat(data.name);
                };

                bttvSocket.events.lookup_user = function(subscription) {
                    if (!subscription.pro && !subscription.subscribed) return;
                    if (subscription.pro && subscription.emotes) {
                        console.log('Added BTTV pro emotes for ' + subscription.name);
                        Chat.vars.proEmotes[subscription.name] = {};
                        subscription.emotes.forEach(function(emote) {
                            Chat.vars.proEmotes[subscription.name][emote.code] = {
                                restrictions: emote.restrictions,
                                code: emote.code,
                                source: 'bttv',
                                id: emote.id,
                                '1x': emote.urlTemplate.replace('{{id}}', emote.id).replace('{{image}}','1x'),
                                '2x': emote.urlTemplate.replace('{{id}}', emote.id).replace('{{image}}','2x')
                            };
                        });
                    }
                };

                bttvSocket.onopen = function() {
                    var channel = Chat.vars.channel;
                    if (!channel.length) return;

                    if (this._joinedChannel) {
                        this.emit('part_channel', { name: this._joinedChannel });
                    }

                    this.emit('join_channel', { name: channel });
                    this._joinedChannel = channel;
                }

                bttvSocket.onmessage = function(message) {
                    var evt = JSON.parse(message.data);
                    if (!evt || !(evt.name in this.events)) return;
                    this.events[evt.name](evt.data);
                }

                Chat.vars.bttvSocket = bttvSocket;
            });
        });
    },
    loadEmotes: function(callback) {
        ['emotes', 'channels/' + encodeURIComponent(Chat.vars.channel)].forEach(function(endpoint) {
            $.getJSON('https://api.betterttv.net/2/' + endpoint).done(function(data) {
                data.emotes.forEach(function(emote) {
                    Chat.vars.extraEmotes[emote.code] = {
                        restrictions: emote.restrictions,
                        code: emote.code,
                        source: 'bttv',
                        id: emote.id,
                        '1x': data.urlTemplate.replace('{{id}}', emote.id).replace('{{image}}','1x'),
                        '2x': data.urlTemplate.replace('{{id}}', emote.id).replace('{{image}}','2x'),
                        '3x': data.urlTemplate.replace('{{id}}', emote.id).replace('{{image}}','3x')
                    };
                });
            });
        });

        ['set/global', 'room/' + encodeURIComponent(Chat.vars.channel)].forEach(function(endpoint) {
            $.getJSON('https://api.frankerfacez.com/v1/' + endpoint).done(function(data) {
                if(typeof data.sets !== 'object') return;

                Object.keys(data.sets).forEach(function(set) {
                    set = data.sets[set];

                    if(!set.emoticons || !Array.isArray(set.emoticons)) return;

                    set.emoticons.forEach(function(emoticon) {
                        if(!emoticon.name || !emoticon.id) return;
                        if(typeof emoticon.name !== 'string' || typeof emoticon.id !== 'number') return;

                        if(Chat.vars.extraEmotes[emoticon.name]) return;

                        if(!emoticon.urls || typeof emoticon.urls !== 'object') return;

                        if(typeof emoticon.urls[1] !== 'string') return;
                        if(emoticon.urls[2] && typeof emoticon.urls[2] !== 'string') return;

                        Chat.vars.extraEmotes[emoticon.name] = {
                            source: 'ffz',
                            code: emoticon.name,
                            id: emoticon.id,
                            '1x': emoticon.urls[1],
                            '2x': emoticon.urls[2] || emoticon.urls[1].replace(/1$/, '2')
                        };
                    });
                });
            });
        });

        callback(true);
    },
    loadTheme: function(id) {
        $.getJSON("themes/" + encodeURIComponent(id) + ".json").done(function(e) {
            if(!e.key) return;
            var $css = $('<style></style>');
            $css.attr('type', 'text/css');
            $css.html(e.css);
            $("head").append($css);
            Chat.vars.themeNameCC = e.nameCC;
        });
    },
    loadSubscriberBadge: function(callback) {
        getTwitchAPI("https://api.twitch.tv/v5/users?login=" + Chat.vars.channel).done(function(e) {
            Chat.vars.channelId = e.users[0]._id;
            getTwitchAPI("https://badges.twitch.tv/v1/badges/channels/" + e.users[0]._id + "/display").done(function(e) {
                transformBadges(e.badge_sets).forEach(function(badge) {
                    badge.versions.forEach(function(version) {
                        Chat.vars.badges[badge.type + ':' + version.type] = version.image_url_4x;
                    });
                });
                callback(true);
            });
        });
    },
    loadGlobalBadges: function(callback) {
        getTwitchAPI("https://badges.twitch.tv/v1/badges/global/display").done(function(e) {
            transformBadges(e.badge_sets).forEach(function(badge) {
                badge.versions.forEach(function(version) {
                    Chat.vars.badges[badge.type + ':' + version.type] = version.image_url_4x;
                });
            });
            Chat.loadSubscriberBadge(callback);
        });
    },
    loadCheers: function() {
        getTwitchAPI("https://api.twitch.tv/v5/bits/actions?channel_id=" + Chat.vars.channelId).done(function(e) {
            try {
                e.actions.forEach(function(action) {
                    var cheer = Chat.vars.cheers[action.prefix] = {};
                    action.tiers.forEach(function(tier) {
                        cheer[tier.min_bits] = tier.images.light.animated['4'];
                    });
                });
            } catch(e) {}
        });
    },
    parseTags: function(nick, tags) {
        var defaultColors = ["#FF0000", "#0000FF", "#008000", "#B22222", "#FF7F50", "#9ACD32", "#FF4500", "#2E8B57", "#DAA520", "#D2691E", "#5F9EA0", "#1E90FF", "#FF69B4", "#8A2BE2", "#00FF7F"];

        var res = {
            name: nick,
            displayName: nick,
            color: defaultColors[nick.charCodeAt(0) % 15],
            emotes: null,
            badges: [],
            bits: 0
        };

        if(tags['display-name'] && typeof tags['display-name'] === 'string') {
            res.displayName = tags['display-name'];
        }

        if(tags.color && typeof tags.color === 'string') {
            res.color = tags.color;
        }

        if(tags.emotes && typeof tags.emotes === 'string') {
            res.emotes = tags.emotes;
        }

        if(tags.badges && typeof tags.badges === 'string') {
            res.badges = tags.badges.split(',').map(function(badge) {
                badge = badge.split('/');
                return {
                    type: badge[0],
                    version: badge[1]
                };
            });
        }

        if(tags.bits) {
            res.bits = +tags.bits;
        }

        return res;
    },
    vars: {
        queue: [],
        maxDisplayTime: getParameterByName('fade') === 'true' ? 30 : parseInt(getParameterByName('fade')),
        queueTimer: setInterval(function() {
            if(Chat.vars.queue.length > 0) {
                var newLines = Chat.vars.queue.join('');
                Chat.vars.queue = [];
                $('#chat_box').append(newLines);

                if(Chat.vars.preventClipping) {
                    var totalHeight = Chat.vars.max_height;
                    var currentHeight = $('#chat_box').outerHeight(true) + 5;
                    var count = 0;
                    var $chatLine, lineHeight;
                    while(currentHeight > totalHeight) {
                        $chatLine = $('.chat_line').eq(count);
                        lineHeight = $chatLine.height();

                        $chatLine.animate(
                            {
                                "margin-top": -lineHeight
                            },
                            100,
                            function() {
                                $(this).remove();
                            }
                        );

                        currentHeight -= lineHeight;
                        count++;
                    }
                    return;
                }

                $('#chat_box')[0].scrollTop = $('#chat_box')[0].scrollHeight;
                var linesToDelete = $('#chat_box .chat_line').length - Chat.vars.max_messages;

                if(linesToDelete > 0) {
                    for(var i=0; i<linesToDelete; i++) {
                        $('#chat_box .chat_line').eq(0).remove();
                    }
                }
            } else if(getParameterByName('fade')) {
                var messagePosted = $('#chat_box .chat_line').eq(0).data('timestamp');
                if((Date.now()-messagePosted)/1000 >= Chat.vars.maxDisplayTime) {
                    $('#chat_box .chat_line').eq(0).addClass('on_out').fadeOut(function() {
                        $(this).remove();
                    });
                }
            }
        }, 250),
        style: getParameterByName('style').toLowerCase() || 'clear',
        theme: getParameterByName('theme').toLowerCase(),
        preventClipping: getParameterByName('prevent_clipping') === 'true' ? true : false,
        themeNameCC: null,
        socket: null,
        bttvSocket: null,
        channel: null,
        max_messages: 100,
        max_height: 720,
        extraEmotes: {},
        proEmotes: {},
        spammers: [],
        cheers: {},
        badges: {},
    }
};