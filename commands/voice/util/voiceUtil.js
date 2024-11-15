const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

const joinVoice = (interaction) => {
    let member = interaction.member.voice.channel;
    let connection = getVoiceConnection(member.guild.id);

    if (!connection) {
        connection = joinVoiceChannel({
            channelId: member.id,
            guildId: member.guild.id,
            adapterCreator: member.guild.voiceAdapterCreator,
        });
    }

    return connection;
}

const getVoice = (interaction) => {
    let member = interaction.member.voice.channel;
    return getVoiceConnection(member.guild.id);
}

module.exports = { joinVoice, getVoice }