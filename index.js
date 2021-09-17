const { Client, Intents, MessageEmbed } = require('discord.js');
const { token } = require('./config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const { hideLinkEmbed } = require('@discordjs/builders');
const ytdl = require('youtube-dl-exec').raw;
const ytdlcore = require('ytdl-core-discord');
const ytsr = require('ytsr');
const ytpl = require('ytpl');

global.AbortController = require('abort-controller');

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
        case 'clear':
            await clear(interaction);
            break;
        case 'remove':
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
        .addFields(
            { name: "\u200B", value: "**help** - shows this list." },
            { name: "\u200B", value: "**ping** - Pong!" },
            { name: "\u200B", value: "**play [url]** - plays the Youtube video as audio in voice channels. " },
            { name: "\u200B", value: "**search [keyword]** - search Youtube and return 10 results." },
            { name: "\u200B", value: "**pause** - pause the currently playing audio." },
            { name: "\u200B", value: "**resume** - resume the currently paused audio." },
            { name: "\u200B", value: "**skip** - skip the currently playing audio." },
            { name: "\u200B", value: "**queue** - list all the audio to be played." },
            { name: "\u200B", value: "**clear** - clear the existing queue." },
            { name: "\u200B", value: "**remove [x]** - remove the audio in the x position of the queue." },
            { name: "\u200B", value: "**disconnect** - disconnect the bot from the channel."}
        );

    try {
        channel.send({ embeds: [embed] });
        return await interaction.reply("Showing help:");
    } catch (e) {
        console.log(`Error while replying in help(): ${e}`);
    }
}

// I AM THE STORM THAT IS APPROACHING   https://www.youtube.com/watch?v=Jrg9KxGNeJY
// Crying for rain                      https://www.youtube.com/watch?v=0YF8vecQWYs
// 5 second countdown                   https://www.youtube.com/watch?v=TLwhqmf4Td4
async function play(interaction) {
    const input = interaction.options.get("input").value;
    if (!input.includes("https://www.youtube.com")) {
        try {
            return await interaction.reply("Please input a valid Youtube link!");
        } catch (e) {
            console.log(`Error while replying in play() (invalid link): ${e}`);
        }
    }

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
                const search = await ytsr(input, { limit: 1 });
                urlList.push(search.items[0].url);
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
                const status = urlList.length == 1 ? 'Now playing' : 'Added to queue';
                const url = input;
                const title = (await ytdlcore.getBasicInfo(url)).videoDetails.title;
        
                await interaction.reply(`${status} - [${title}](${url})`);
            } catch (e) {
                console.log(`Error while replying in play() (no list): ${e}`);
            }
        } catch (e) {
            console.log(`Error while setting url in play(): ${e}`);
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
                    const status = 'Added playlist';
                    const url = input;
                    const title = playlist.title;

                    await interaction.reply(`${status} - [${title}](${url})`);
                } catch (e) {
                    console.log(`Error while replying in play() (has list): ${e}`);
                }
            });
        } catch (e) {
            console.log(`Error while setting playlist in play(): ${e}`);
        }
    }
    
    player.on('stateChange', (oldState, newState) => {
        console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
    });

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
    try {
        const search = await ytsr(keyword, { limit: 10 });
        
        const results = [];
        search.items.forEach(s => {
            results.push({ title: s.title, author: s.author.name, url: s.url, timestamp: s.duration });
        });
    } catch (e) {
        console.log(`Error while searching in search(): ${e}`);
    }

    if (results.length > 0) {
        const channel = client.channels.cache.get(interaction.channelId);
        const embed = new MessageEmbed()
            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL());
    
        results.forEach((r, i) => {
            embed.addField("\u200B", `${i+1}. [${r.title} by ${r.author}](${r.url}) **(${r.timestamp})**`);
        });
    
        channel.send({ embeds: [embed] });
    
        try {
            return await interaction.reply(`Showing results for "${keyword}`);
        } catch (e) {
            console.log(`Error while replying in search() (has results): ${e}`);
        }
    } else {
        try {
            return await interaction.reply(`No results found for "${keyword}"!`);
        } catch (e) {
            console.log(`Error while replying in search() (no results): ${e}`);
        }
    }
}

async function skip(interaction) {
    player.stop();
        
    try {
        return await interaction.reply("Skipped!");
    } catch (e) {
        console.log(`Error while replying in queue() (playing: no queue): ${e}`);
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

    try {
        return await interaction.reply("Not yet implemented.");
    } catch (e) {
        console.log(`Error while replying in queue(): ${e}`);
    }
}

async function clear(interaction) {
    if (urlList.length > 1) {
        urlList.splice(1, urlList.length);
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