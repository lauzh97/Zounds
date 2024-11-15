const ytStream = require('yt-stream')
const { createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { default: YouTube } = require('youtube-sr');

const playAudio = async (connection, url) => {
    global.nowPlaying = await YouTube.getVideo(url);
    console.log("preparing audio for: " + global.nowPlaying.title);

    const source = await ytStream.stream(url, {
        type: 'audio'
    }).catch(() => {
        console.log("YTStream error: unable to stream: " + global.nowPlaying.title);
    });

    const audioResource = createAudioResource(source.stream, {
        metadata: {
            title: "testing",
        }
    });

    global.player.play(audioResource);
    connection.subscribe(global.player);

    global.player.on('error', error => {
        console.error(`AudioPlayer error: ${error.message}`);
    });

    global.player.on(AudioPlayerStatus.Playing, () => {
        if (global.inactivityTimeout) {
            clearTimeout(global.inactivityTimeout);
        }
    });

    console.log("now playing: " + global.nowPlaying.title);

    return global.nowPlaying;
}

module.exports = { playAudio }