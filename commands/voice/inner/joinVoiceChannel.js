const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

const JoinVoiceChannel = (interaction) => {
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

module.exports = { JoinVoiceChannel }