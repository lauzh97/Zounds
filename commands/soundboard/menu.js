const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ButtonComponent } = require('discord.js');
const { joinVoiceChannel, createAudioResource } = require('@discordjs/voice');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('menu')
		.setDescription('Shows the soundboard menu'),
	async execute(interaction, mp3List, player) {
        const row = new ActionRowBuilder()
        for (const mp3 of mp3List) {
            const button = new ButtonBuilder()
                .setCustomId(mp3.name)
                .setLabel(mp3.name)
                .setStyle(ButtonStyle.Primary);
                
            row.addComponents(button);
        }

        const response = await interaction.reply({
            content: `soundboard lmao`,
            components: [row],
            ephemeral: true,
        });

        try {
            const collector = response.createMessageComponentCollector({ 
                componentType: ButtonComponent.type
            });

            collector.on('collect', async i => {
                const voiceChannel = interaction.member.voice.channel;
    
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: voiceChannel.guild.id,
                    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                });
    
                connection.subscribe(player);

                const mp3 = mp3List.filter(function(item) { return item.name === i.customId; });
                const resource = createAudioResource(mp3[0].resource);
                player.play(resource);
                i.deferUpdate();
            });
        } catch (e) {
            console.log(e);
            await interaction.editReply({ content: 'An unexpected error has occurred!', ephemeral: true });
        }
	},
};