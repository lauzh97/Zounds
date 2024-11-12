const ytStream = require('yt-stream')
const { createAudioResource, createAudioPlayer, NoSubscriberBehavior } = require('@discordjs/voice');

const playAudio = async (connection, url) => {
    if (!global.player) {
        global.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.play,
            }
        });
    }

    const source = await ytStream.stream(url, {
        type: 'audio'
    });

    const audioResource = createAudioResource(source.stream, {
        metadata: {
            title: "testing",
        }
    });
    global.player.play(audioResource);
    connection.subscribe(global.player);
}

module.exports = { playAudio }