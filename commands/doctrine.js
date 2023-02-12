const { SlashCommandBuilder } = require("discord.js");
const { getRandomColor } = require("../function.js");
const sql = require("sqlite3");

var usedCommandrecently = []; //for implementing the command cool down

module.exports = {
  data: new SlashCommandBuilder()
    .setName("doctrine")
    .setDescription("Tells you info about every doctrine!")
    .addStringOption((option) =>
      option
        .setName("doctrine")
        .setDescription("What doctrine you want info about?")
        .setRequired(true)
        .addChoices(
          { name: "All", value: "all" },
          { name: "Axis", value: "axis" },
          { name: "Allies", value: "allies" },
          { name: "Comintern", value: "comintern" },
          { name: "Pan-asian", value: "pan-asian" }
        )
    ),
  async execute(interaction) {
    let doctrineDb = new sql.Database("./data/doctrines.db", sql.OPEN_READONLY);
    let embeds = [];

    let doctrine = interaction.options.getString("doctrine");
    const userId = interaction.user.id.toString();

    const cooldownTime = 6000; //in milli second, 1000 millisecond = 1 second

    //command cooldown
    if (usedCommandrecently.includes(userId)) {
      content = `This command has a **cooldown** of **${
        cooldownTime / 1000
      }s**\nPlease be patient.`;
      await interaction.reply({ content: content, ephemeral: true });
      return;
    }

    //set cooldown
    usedCommandrecently.push(userId);
    setTimeout(() => {
      delete usedCommandrecently[usedCommandrecently.indexOf(userId)];
    }, cooldownTime);

    await interaction.deferReply();

    if (doctrine === "all") {
      doctrineList = ["axis", "allies", "commintern", "pan-asian"];
      mainEmbed = {
        color: getRandomColor(),
        title: "Doctrines",
        thumbnail: {
          url: "https://www.callofwar.com/fileadmin/images/cow_wiki/cow_wiki_logo.png",
        },
        url: "https://wiki.callofwar.com/wiki/DOCTRINES",
        description: `
        Each country in Call of War belongs to one of four Doctrines: Axis, Allies, Comintern and Pan-asian.

Doctrines grant various advantages and disadvantages, emphasizing different styles of play. Successful generals know about these differences and use them to their advantage. It is recommended to select countries with different Doctrines when starting new game rounds to learn them in practice. Which Doctrine belongs to which country is shown in the country selection screen and in various other places in the game.

Each Doctrine has a main focus with general strengths and weaknesses, which are applied to all units of that Doctrine. Furthermore certain iconic units of each Doctrine gain additional advantages or disadvantages, which are added on top of the general strengths and weaknesses (note: The percentage values are added up before they are applied to a unit). Doctrines can also alter the day of availability of units, with unit levels becoming available earlier or later in research. A negative number here indicates that the research is becoming available earlier, while a positive number indicates a later availability. These availability changes do not affect research levels on day 1.
        `,
        image: {
          url: "https://wiki.callofwar.com/images/1/1e/Doctrine_overview.png",
        },
      };
      embeds.push(mainEmbed);
    } else {
      doctrineList = [doctrine];
    }
    if (doctrine === "all") {
      sqlCommand = `SELECT *
    FROM doctrines`;
      doctrineDb.each(sqlCommand, (err, row) => {
        if (err) {
          throw err;
        }
        let doctrineEmbed = {
          title: "**" + row.doctrine.toUpperCase() + "**",
          color: getRandomColor(),
          thumbnail: {
            url: "https://www.callofwar.com/fileadmin/images/cow_wiki/cow_wiki_logo.png",
          },
          fields: [
            {
              name: "\u200b",
              value: "\u200b",
              inline: false,
            },
            {
              name: ":green_square: __**Buffs**__",
              value: row.buffs.replaceAll(",", "\n"),
              inline: true,
            },
            {
              name: "\u200b",
              value: "\u200b",
              inline: true,
            },
            {
              name: ":red_square: __**Debuffs**__",
              value: row.debuffs.replaceAll(",", "\n"),
              inline: true,
            },
            {
              name: "\u200b",
              value: "\u200b",
              inline: false,
            },
            {
              name: ":green_square: __**Buffed Units**__",
              value: row.buffed_units.replaceAll(",", "\n"),
              inline: true,
            },
            {
              name: "\u200b",
              value: "\u200b",
              inline: true,
            },
            {
              name: ":red_square: __**Debuffed Units**__",
              value: row.debuffed_units.replaceAll(",", "\n"),
              inline: true,
            },
          ],
        };
        embeds.push(doctrineEmbed);
        interaction.editReply({ embeds: embeds });
      });
    } else {
      sqlCommand = `SELECT *
    FROM doctrines
    WHERE doctrine = ?`;
      doctrineDb.each(sqlCommand, [doctrineList[0]], (err, row) => {
        if (err) {
          throw err;
        }
        let doctrineEmbed = {
          title: "**" + row.doctrine.toUpperCase() + "**",
          color: getRandomColor(),
          thumbnail: {
            url: "https://www.callofwar.com/fileadmin/images/cow_wiki/cow_wiki_logo.png",
          },
          fields: [
            {
              name: "\u200b",
              value: "\u200b",
              inline: false,
            },
            {
              name: ":green_square: __**Buffs**__",
              value: row.buffs.replaceAll(",", "\n"),
              inline: true,
            },
            {
              name: "\u200b",
              value: "\u200b",
              inline: true,
            },
            {
              name: ":red_square: __**Debuffs**__",
              value: row.debuffs.replaceAll(",", "\n"),
              inline: true,
            },
            {
              name: "\u200b",
              value: "\u200b",
              inline: false,
            },
            {
              name: ":green_square: __**Buffed Units**__",
              value: row.buffed_units.replaceAll(",", "\n"),
              inline: true,
            },
            {
              name: "\u200b",
              value: "\u200b",
              inline: true,
            },
            {
              name: ":red_square: __**Debuffed Units**__",
              value: row.debuffed_units.replaceAll(",", "\n"),
              inline: true,
            },
          ],
        };

        embeds.push(doctrineEmbed);
        interaction.editReply({ embeds: embeds });
      });
    }
  },
};
