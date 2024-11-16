const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getQueue } = require('./util/queueUtil');
const { default: YouTube } = require('youtube-sr');

const sortQueue = ( a, b ) => {
    if ( a.sortId < b.sortId ){
      return -1;
    }
    if ( a.sortId > b.sortId ){
      return 1;
    }
    return 0;
  }

const populateQueue = async () => {
    let queueFields = [];
    let getInfoPromises = [];

    for(let i=0; i<10; i++) {
        const startIndex = global.selectedPage * 10;
        const queueItem = getQueue()[startIndex + i];

        if (startIndex == 0 && getQueue().length == 0) {
            return;
        }

        if (queueItem) {
            getInfoPromises.push(
                YouTube.getVideo(queueItem)
                    .then((info) => {
                        queueFields.push(
                            { 
                                name: (startIndex + i + 1) + ". " + info.title, 
                                value: "(" + info.durationFormatted + ")" + " [YouTube :link:](" + info.url + ") by " + info.channel.name, 
                                sortId: (startIndex + i + 1) 
                            }
                        );
                    })
            );
        }
    }

    await getInfoPromises.reduce(async (acc, currentPromise) => {
        // Wait for previous promises to resolve
        const results = await acc;
        // Add current promise result
        return [...results, await currentPromise];
        // Initial accumulator is an empty resolved promise
    }, Promise.resolve([]));
    
    return queueFields.sort(sortQueue);
}

const queueFunc = async (interaction) => {
    const totalPages = Math.ceil(getQueue().length/10);
    let queueFields = [];

    if (!global.selectedPage) global.selectedPage = 0;

    queueFields = await populateQueue();

    if (!queueFields) {
        await interaction.editReply({
            content: 'Nothing in queue! Maybe check /nowplaying instead?'
        });

        return;
    }

    const queueEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Current queue (' + getQueue().length + '):')
        .setTimestamp()
        .addFields(queueFields);

    const prevBtn = new ButtonBuilder()
        .setCustomId("prevBtn")
        .setLabel("Prev")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(global.selectedPage == 0)

    const nextBtn = new ButtonBuilder()
        .setCustomId("nextBtn")
        .setLabel("Next")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(global.selectedPage == totalPages - 1)

    const closeBtn = new ButtonBuilder()
        .setCustomId("closeBtn")
        .setLabel("Close")
        .setStyle(ButtonStyle.Danger)

    const row = new ActionRowBuilder()
        .addComponents(prevBtn, nextBtn, closeBtn);

    return {
        queueEmbed: queueEmbed,
        row: row
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('display the current music queue!'),
	async execute(interaction) {
        await interaction.deferReply();
        const queue = await queueFunc(interaction);

        await interaction.editReply({
            content: "",
            embeds: [queue.queueEmbed],
            components: [queue.row]
        });
	},
    async btnInteraction(interaction) {
        try {
            if ("prevBtn" === interaction.customId) {
                global.selectedPage--;
            } else if ("nextBtn" === interaction.customId) {
                global.selectedPage++;
            } else if ("closeBtn" === interaction.customId) {
                global.selectedPage = 0;

                await interaction.update({
                    content: 'Closed queue!',
                    embeds: [],
                    components: [],
                });

                return;
            } else {
                await interaction.update({ 
                    content: 'Queue error! unknown button! How the fk did you managed that?', 
                    components: [],
                    ephemeral: true
                });     
            }

            await interaction.update({
                content: "Loading page, this might take some time...",
                components: []
            });

            const queue = await queueFunc(interaction);
            
            await interaction.editReply({
                content: "",
                embeds: [queue.queueEmbed],
                components: [queue.row]
            });
        } catch (e) {
            console.log(e);
            await interaction.editReply({ 
                content: 'Queue error!', 
                components: [],
                ephemeral: true
            });        
        }
    }
};