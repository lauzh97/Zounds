const { Client, Intents, MessageEmbed } = require('discord.js');
const { token } = require('./config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const { hideLinkEmbed } = require('@discordjs/builders');
const ytdl = require('youtube-dl-exec').raw;
const ytdlcore = require('ytdl-core-discord');
const yts = require('yt-search');
const ytpl = require('ytpl');
const shuffle = require('shuffle-array');

const player = createAudioPlayer();
const urlList = [];

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    switch (commandName) {
        case 'ping':
            await ping(interaction);
            break;
        case 'help':
            await help(interaction);
            break;
        case 'play':
            await play(interaction);
            break;
        case 'search':
            await search(interaction);
            break;
        case 'now':
            await now(interaction);
            break;
        case 'pause':
            await pause(interaction);
            break;
        case 'resume':
            await resume(interaction);
            break;
        case 'skip':
            await skip(interaction);
            break;
        case 'queue':
            await queue(interaction);
            break;
        case 'shuffle':
            await shuffleQ(interaction);
            break;
        case 'clear':
            await clear(interaction);
            break;
        case 'remove':
            await remove(interaction);
            break;
        case 'disconnect':
            await disconnect(interaction);
            break;
        default:
            await interaction.reply("Unrecognized command, /help for a list of available commands.");
            break;
    }
});

async function ping(interaction) {
    try {
        return await interaction.reply("Pong!");
    } catch (e) {
        console.log(`Error while replying in ping(): ${e}`);
    }
}

async function help(interaction) {
    const channel = client.channels.cache.get(interaction.channelId);
    const embed = new MessageEmbed()
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
        .setTimestamp()
        .addFields(
            { name: "\u200B", value: "**/help** - shows this list." },
            { name: "\u200B", value: "**/ping** - Pong!" },
            { name: "\u200B", value: "**/play [url]** - plays the Youtube video as audio in voice channels. " },
            { name: "\u200B", value: "**/search [keyword]** - search Youtube and return 10 results." },
            { name: "\u200B", value: "**/now** - show details of currently playing audio." },
            { name: "\u200B", value: "**/skip** - skip the curretly playing audio." },
            { name: "\u200B", value: "**/pause** - pause the currently playing audio." },
            { name: "\u200B", value: "**/resume** - resume the currently paused audio." },
            { name: "\u200B", value: "**/queue** - show the audio queue." },
            { name: "\u200B", value: "**/shuffleQ** - shuffle the queue." },
            { name: "\u200B", value: "**/clear** - clear the existing queue." },
            { name: "\u200B", value: "**/remove [x]** - remove the audio in the x position of the queue." },
            { name: "\u200B", value: "**/disconnect** - disconnect the bot from the channel." }
        );

    try {
        await interaction.deferReply();
        channel.send({ embeds: [embed] });
        return await interaction.editReply("Showing help:");
    } catch (e) {
        console.log(`Error while replying in help(): ${e}`);
    }
}

async function play(interaction, paramUrl = "") {
    const input = paramUrl == ""? interaction.options.get("input").value : paramUrl;

    const channel = interaction.member.voice.channel;
    if (!channel) {
        try {
            return await interaction.reply("Please join a voice channel first!");
        } catch (e) {
            console.log(`Error while replying in play() (no channel): ${e}`);
        }
    }

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const hasList = ytpl.validateID(input);
    if (!hasList) {
        try {
            if (!ytdlcore.validateURL(input)) {
                const search = await yts(input);
                urlList.push(search.videos[0].url);
            } else {
                urlList.push(input);
            }

            if (urlList.length == 1) {
                const stream = ytdl(urlList[0], {
                    o: '-',
                    q: '',
                    f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                    r: '100K',
                }, { stdio: ['ignore', 'pipe', 'ignore'] });
                const resource = createAudioResource(stream.stdout);

                player.play(resource);
                connection.subscribe(player);
            }

            try {
                const isFirst = urlList.length == 1 ? true : false;
                const status = isFirst ? '`Now playing' : '`Added to queue';
                const url = isFirst ? urlList[0] : urlList[urlList.length - 1];
                const title = (await ytdlcore.getBasicInfo(url)).videoDetails.title;

                if (paramUrl != "") {
                    await interaction.followUp(`${status}\` - [${title}](${isFirst ? url : hideLinkEmbed(url)})`);
                } else {
                    await interaction.reply(`${status}\` - [${title}](${isFirst ? url : hideLinkEmbed(url)})`);
                }
            } catch (e) {
                console.log(`Error while replying in play() (no list): ${e}`);
            }
        } catch (e) {
            console.log(`Error while setting url in play() (no list): ${e}`);
        }
    } else {
        try {
            ytpl.getPlaylistID(input).then(async (id) => {
                const playlist = await ytpl(id, { limit: Infinity });
                playlist.items.forEach(pl => {
                    const i = pl.url.indexOf("&list=");
                    urlList.push(pl.url.slice(0, i));
                });

                if (urlList.length == playlist.items.length) {
                    const stream = ytdl(urlList[0], {
                        o: '-',
                        q: '',
                        f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                        r: '100K',
                    }, { stdio: ['ignore', 'pipe', 'ignore'] });
                    const resource = createAudioResource(stream.stdout);

                    player.play(resource);
                    connection.subscribe(player);
                }

                try {
                    const status = '`Added playlist to queue';
                    const url = input;
                    const title = playlist.title;

                    if (paramUrl != "") {
                        await interaction.followUp(`${status} (${playlist.items.length} added)\` - [${title}](${url})`);
                    } else {
                        await interaction.reply(`${status} (${playlist.items.length} added)\` - [${title}](${url})`);
                    }
                } catch (e) {
                    console.log(`Error while replying in play() (has list): ${e}`);
                }
            });
        } catch (e) {
            console.log(`Error while setting playlist in play() (has list): ${e}`);
        }
    }

    // player.on('stateChange', (oldState, newState) => {
    //     console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
    // });

    player.on(AudioPlayerStatus.Idle, () => {
        urlList.shift();
        if (urlList.length > 0) {
            const stream = ytdl(urlList[0], {
                o: '-',
                q: '',
                f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                r: '100K',
            }, { stdio: ['ignore', 'pipe', 'ignore'] });
            const resource = createAudioResource(stream.stdout);

            player.play(resource);
        }
    });

    player.on('error', async (error) => {
        console.log(error);
        interaction.reply("An error has occurred, please check the console. Skipping...");

        try {
            await skip();
        } catch (e) {
            console.log(`Error while skipping audio in play(): ${e}`);
        }
    });

    return
}

async function search(interaction) {
    const keyword = interaction.options.get("keyword").value;
    const results = [];

    try {
        const search = await yts(keyword);
        const videos = search.videos.slice(0, 10);

        videos.forEach((v) => {
            results.push({
                title: v.title,
                author: v.author.name,
                url: v.url,
                timestamp: v.timestamp
            });
        });
    } catch (e) {
        console.log(`Error while searching in search() (search): ${e}`);
    }

    if (results.length > 0) {
        const channel = client.channels.cache.get(interaction.channelId);
        const embed = new MessageEmbed()
            .setAuthor(`Request by ${interaction.user.username}`, interaction.user.displayAvatarURL())
            .setTimestamp();

        results.forEach((r, i) => {
            embed.addField("\u200B", `${i + 1}. [${r.title} by ${r.author}](${r.url}) **(${r.timestamp})**`);
        });

        embed.addField("\u200B", `Reply \`1 ~ 10\` to pick from search result, reply \`cancel\` to cancel the request.`);

        try {
            channel.send({ embeds: [embed] });

            interaction.reply(`Showing results for "\`${keyword}\`"`, { fetchReply: true })
                .then(() => {
                    channel.awaitMessages({ max: 1, time: 30000, errors: ['time'] })
                        .then((collected) => {
                            const content = collected.first().content;

                            if (Number(content) > 0 && Number(content) < 11) {
                                url = results[Number(content)].url;
                                play(interaction, url);
                            } else if (content == "cancel") {
                                interaction.editReply(`Search results for "\`${keyword}\`" expired.`)
                                interaction.followUp("Cancelled!");
                            } else {
                                interaction.editReply(`Search results for "\`${keyword}\`" expired.`)
                                interaction.followUp("Invalid response!");
                            }
                        })
                        .catch(() => interaction.editReply(`Search results for "\`${keyword}\`" expired.`));
                });
            return
        } catch (e) {
            console.log(`Error while replying in search() (has results): ${e}`);
        }
    } else {
        try {
            return await interaction.reply(`No results found for "\`${keyword}\`"!`);
        } catch (e) {
            console.log(`Error while replying in search() (no results): ${e}`);
        }
    }
}

async function now(interaction) {
    if (urlList.length < 1) {
        try {
            return await interaction.reply("Not playing any audio!");
        } catch (e) {
            console.log(`Error while replying in now() (no audio playing): ${e}`);
        }
    }

    try {
        const channel = client.channels.cache.get(interaction.channelId);
        const vidDetails = (await ytdlcore.getInfo(urlList[0])).videoDetails;
        const vidMinute = Math.floor(vidDetails.lengthSeconds / 60);
        const vidSecond = Math.floor(vidDetails.lengthSeconds - (vidMinute * 60));
        const nextVidTitle = urlList.length > 1 ? (await ytdlcore.getBasicInfo(urlList[1])).videoDetails.title : "None";
        const embed = new MessageEmbed()
            .setAuthor(vidDetails.title, null, vidDetails.video_url)
            .setThumbnail(vidDetails.thumbnails[0].url)
            .addFields(
                { name: "\u200B", value: `Author: \`${vidDetails.author.name}\`` },
                { name: "\u200B", value: `Length: \`${vidMinute}:${vidSecond}\`` },
                { name: "\u200B", value: `Next: \`${nextVidTitle}\`` }
            );

        try {
            await interaction.deferReply();
            channel.send({ embeds: [embed] });
            return await interaction.editReply("Now playing");
        } catch (e) {
            console.log(`Error while replying in now(): ${e}`);
        }
    } catch (e) {
        console.log(`Error while creating embed in now(): ${e}`);
    }
}

async function skip(interaction) {
    player.stop();

    try {
        return await interaction.reply("Skipped!");
    } catch (e) {
        console.log(`Error while replying in skip(): ${e}`);
    }
}

async function pause(interaction) {
    try {
        if (player.pause()) {
            return await interaction.reply("Paused!");
        } else {
            return await interaction.reply("Already paused or nothing to pause!");
        }
    } catch (e) {
        console.log(`Error while replying in pause(): ${e}`);
    }
}

async function resume(interaction) {
    try {
        if (player.unpause()) {
            return await interaction.reply("Resumed!");
        } else {
            return await interaction.reply("Already resumed or nothing to resume!");
        }
    } catch (e) {
        console.log(`Error while replying in resume(): ${e}`);
    }
}

async function queue(interaction) {
    const input = interaction.options.get("page") ? interaction.options.get("page").value : 1;
    if (input < 1) {
        try {
            return await interaction.reply("Page cannot be less than 1!");
        } catch (e) {
            console.log(`Error while replying in queue() (input): ${e}`);
        }
    }

    if (urlList.length == 0) {
        try {
            return await interaction.reply("No queue to show!");
        } catch (e) {
            console.log(`Error while replying in queue() (no queue): ${e}`);
        }
    }

    const channel = client.channels.cache.get(interaction.channelId);
    const embed = new MessageEmbed()
        .setAuthor(`Requested by ${interaction.user.username}`, interaction.user.displayAvatarURL())
        .setTimestamp();

    try {
        const doQueue = async () => {
            const index = (input - 1) * 10;
            for (let i = index; i < index + 10; i++) {
                const url = urlList[i];
                if (url != null) {
                    const vidDetails = (await ytdlcore.getBasicInfo(url)).videoDetails;
                    const data = { title: vidDetails.title, author: vidDetails.author.name, url: vidDetails.video_url };

                    embed.addField("\u200B", `${i + 1}. [${data.title} by ${data.author}](${data.url})`);
                }
            }
        }

        try {
            await interaction.deferReply();
            await doQueue().then(() => {
                channel.send({ embeds: [embed] });
                return interaction.editReply("Showing queue:");
            });
        } catch (e) {
            console.log(`Error while replying in queue() (show queue): ${e}`);
            return interaction.editReply("Error showing queue, please check console!");
        }
    } catch (e) {
        console.log(`Error while getting queues in queue(): ${e}`);
    }

}

async function shuffleQ(interaction) {
    if (urlList.length > 1) {
        const tempUrl = urlList[0];

        urlList.shift();
        shuffle(urlList);
        urlList.unshift(tempUrl);

        try {
            return await interaction.reply("Shuffled!");
        } catch (e) {
            console.log(`Error while replying in queue() (shuffled): ${e}`);
        }
    } else {
        try {
            return await interaction.reply("No queue to shuffle!");
        } catch (e) {
            console.log(`Error while replying in queue() (no shuffle): ${e}`);
        }
    }

}

async function clear(interaction) {
    if (urlList.length > 1) {
        urlList.splice(0, urlList.length);
        try {
            return await interaction.reply("Cleared queue!");
        } catch (e) {
            console.log(`Error while replying in clear() (has queue): ${e}`);
        }
    }

    try {
        return await interaction.reply("Queue is already empty!");
    } catch (e) {
        console.log(`Error while replying in clear() (no queue): ${e}`);
    }
}

async function remove(interaction) {
    const input = interaction.options.get("x");

    if (urlList.length < input || input < 1) {
        try {
            return await interaction.reply("Remove out of range!");
        } catch (e) {
            console.log(`Error while replying in remove() (out of range): ${e}`);
        }
    }

    urlList.splice(input + 1, 1);

    try {
        return await interaction.reply("Removed!");
    } catch (e) {
        console.log(`Error while replying in remove() (removed): ${e}`);
    }
}

async function disconnect(interaction) {
    const channel = interaction.member.voice.channel;

    if (client.voice.adapters.size > 0) {
        const connection = getVoiceConnection(channel.guild.id);
        urlList.splice(0, urlList.length);
        player.stop();
        connection.destroy();
        try {
            return await interaction.reply("Disconnected!");
        } catch (e) {
            console.log(`Error while replying from disconnect() (in channel): ${e}`);
        }
    }

    try {
        return await interaction.reply("Not connected in the first place!");
    } catch (e) {
        console.log(`Error while replying from disconnect() (not in channel): ${e}`);
    }
}

client.login(token);