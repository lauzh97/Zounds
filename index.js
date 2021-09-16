const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const { hideLinkEmbed } = require('@discordjs/builders');
const ytdl = require('ytdl-core-discord');
const ytsr = require('ytsr');
const ytpl = require('ytpl');

global.AbortController = require('abort-controller');

const player = createAudioPlayer();
const audioQueue = [];

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
    return interaction.reply("Pong!");
}

// TODO: change to use embed msg instead
async function help(interaction) {
    helpTxt  = "```\n";
    helpTxt += "help                - shows this list.\n";
    helpTxt += "ping                - Pong!\n";
    helpTxt += "play [url]          - plays the Youtube video as audio in voice channels. \n";
    helpTxt += "search [keyword]    - search Youtube and return 10 results.\n";
    helpTxt += "pause               - pause the currently playing audio.\n";
    helpTxt += "resume              - resume the currently paused audio.\n";
    helpTxt += "skip                - skip the currently playing audio.\n";
    helpTxt += "queue               - list all the audio to be played.\n";
    helpTxt += "clear               - clear the existing queue.\n";
    helpTxt += "remove [x]          - remove the audio in the x position of the queue.\n";
    helpTxt += "disconnect          - disconnect the bot from the channel.";
    helpTxt += "```";

    return interaction.reply(helpTxt);
}

// I AM THE STORM THAT IS APPROACHING   https://www.youtube.com/watch?v=Jrg9KxGNeJY
// Crying for rain                      https://www.youtube.com/watch?v=0YF8vecQWYs
// 5 second countdown                   https://www.youtube.com/watch?v=TLwhqmf4Td4
async function play(interaction) {
    const channel = interaction.member.voice.channel;
    if(!channel) {
        return interaction.reply("Please join a voice channel first!");
    }

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
    
    const url = interaction.options.get("url").value;
    const validatation = ytdl.validateURL(url);
    let timeout;

    if(validatation) {
        const resource = createAudioResource(await ytdl(url).catch(e => console.log(e)), { filter: 'audioonly', inputType: StreamType.Opus, highWaterMark: 1<<25 }, { highWaterMark: 1 });
        audioQueue.push(resource);
    } else {
        // TODO: implement keyword search here
    }

    if (audioQueue.length - 1 == 0) {
        player.play(audioQueue[0]);
        connection.subscribe(player);
    }

    player.on(AudioPlayerStatus.Idle, () => {
        audioQueue.shift();
        if (audioQueue.length > 0) {
            player.play(audioQueue[0]);
        } else {
            timeout = setTimeout(() => {
                if (client.voice.adapters.size > 0) {
                    connection.destroy();
                }
            }, 30_000);
        }
    });

    player.on(AudioPlayerStatus.Playing, ()=> {
        clearTimeout(timeout);
    });

    player.on('error', (error) => {
        console.log(error);
        interaction.reply("An error has occurred, please check the console. Skipping...");
        audioQueue.shift();
        if (audioQueue.length > 0) {
            player.play(audioQueue[0]);
        }
    });

    if (validatation) {
        if (audioQueue.length - 1 == 0) {
            return interaction.reply(`Now playing - [${(await ytdl.getBasicInfo(url)).videoDetails.title}](${url})`);
        } else {
            return interaction.reply(`Added to queue - [${(await ytdl.getBasicInfo(url)).videoDetails.title}](${hideLinkEmbed(url)})`);
        }
    } else {
        return interaction.reply(`Now playing - `);
    }
}

async function skip(interaction) {
    if (audioQueue.length == 0) {
        return interaction.reply("No audio currently playing!");
    }

    audioQueue.shift();
    if (audioQueue.length > 0) {
        player.play(audioQueue[0]);

        return interaction.reply("Skipped!");
    }
        
    // play 1 second of silence to overwrite currently playing audio
    const resource = createAudioResource('./sounds/silence.mp3');
    player.play(resource);
        
    return interaction.reply("Skipped!");
}

async function pause(interaction) {

}

async function resume(interaction) {

}

async function queue(interaction) {

}

async function clear(interaction) {
    if (audioQueue.length > 1) {
        audioQueue.splice(1, queue.length);
        return interaction.reply("Cleared queue!");
    }

    return interaction.reply("Queue is already empty!");
}

async function disconnect(interaction) {
    const channel = interaction.member.voice.channel;

    if (client.voice.adapters.size > 0) {
        const connection = getVoiceConnection(channel.guild.id);
        connection.destroy();
        return interaction.reply("Disconnected!");
    }

    return interaction.reply("Not connected in the first place!");
}

client.login(token);