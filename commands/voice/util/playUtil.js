const ytStream = require('yt-stream')
const { createAudioResource } = require('@discordjs/voice');

const playAudio = async (connection, url) => {
    const info = await ytStream.getInfo(url);
    console.log("preparing audio for: " + info.title);

    const source = await ytStream.stream(info, {
        type: 'audio'
    }).catch(() => {
        console.log("YTStream error: unable to stream: " + info.title);
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

    console.log("now playing: " + info.title);

    return info;
}

module.exports = { playAudio }