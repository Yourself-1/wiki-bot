const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unit")
    .setDescription("Tells information about a particular unit")
    .addStringOption((option) =>
      option
        .setName("unit")
        .setDescription("Enter the name of the unit")
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("doctrine")
        .setDescription("Enter the doctrine")
        .setRequired(true)
        .addChoices(
          { name: "Base", value: "base" },
          { name: "Axis", value: "axis" },
          { name: "Allies", value: "allies" },
          { name: "Comintern", value: "commintern" },
          { name: "Pan-asian", value: "pa" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("level")
        .setDescription("Enter the level of the unit")
        .setAutocomplete(true)
        .setRequired(true)
    ),
  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    let unit_choices = [
      "aircraft carrier",
      "aircraft transport",
      "anti air",
      "anti tank",
      "armored car",
      "artillery",
      "attack bomber",
      "battleship",
      "commandos",
      "cruiser",
      "destroyer",
      "flying bomb",
      "heavy tank",
      "infantry",
      "interceptor",
      "light tank",
      "mechanized infantry",
      "medium tank",
      "militia",
      "motorized infantry",
      "naval bomber",
      "nuclear bomber",
      "nuclear rocket",
      "paratroopers transport",
      "paratroopers unit",
      "railroadgun",
      "rocket",
      "rocket artillery",
      "rocket fighter",
      "sp anti air",
      "sp artillery",
      "sp rocket artillery",
      "strategic bomber",
      "submarine",
      "tactical bomber",
      "tank destroyer",
      "transport ship",
    ];

    let choices;
    if (
      focusedOption.value === undefined ||
      focusedOption.value === "" ||
      focusedOption.value === " "
    ) {
      if (focusedOption.name === "unit") {
        choices = ["Please enter more letters"];
      }
    } else if (
      focusedOption.name === "unit" &&
      focusedOption.value != undefined
    ) {
      choices = unit_choices.filter((choice) =>
        choice.startsWith(focusedOption.value)
      );
    }
    if (focusedOption.name === "level") {
      lvl1 = [
        "aircraft transport",
        "flying bomb",
        "nuclear rocket",
        "railroadgun",
      ];
      lvl2 = ["rocket fighter", "sp rocket artillery"];
      lvl3 = ["nuclear bomber", "rocket artillery"];
      lvl4 = [
        "commandos",
        "heavy tank",
        "militia",
        "paratroopers transport",
        "paratroopers unit",
        "rocket",
        "transport ship",
      ];
      lvl5 = [
        "armored car",
        "attack bomber",
        "light tank",
        "mechanized infantry",
        "sp anti air",
        "sp artillery",
      ];
      lvl7 = [
        "infantry",
        "interceptor",
        "naval bomber",
        "strategic bomber",
        "tactical bomber",
      ];

      const unit_name = interaction.options.getString("unit").toLowerCase();

      if (unit_name === "" || unit_name === " ") {
        choices = [];
      } else if (lvl1.includes(unit_name)) {
        choices = ["1"];
      } else if (lvl2.includes(unit_name)) {
        choices = ["1", "2"];
      } else if (lvl3.includes(unit_name)) {
        choices = ["1", "2", "3"];
      } else if (lvl4.includes(unit_name)) {
        choices = ["1", "2", "3", "4"];
      } else if (lvl5.includes(unit_name)) {
        choices = ["1", "2", "3", "4", "5"];
      } else if (lvl7.includes(unit_name)) {
        choices = ["1", "2", "3", "4", "5", "6", "7"];
      } else {
        choices = ["1", "2", "3", "4", "5", "6"];
      }
    }
    if (choices.length > 25) {
      console.log(choices);
    }
    await interaction.respond(
      choices.map((choice) => ({ name: choice, value: choice }))
    );
  },
  async execute(interaction) {
    const unit_name = interaction.options.getString("unit").toLowerCase();
    const doctrine = interaction.options.getString("doctrine").toLowerCase();
    var level = parseInt(interaction.options.getString("level"));
    await interaction.reply({
      content: `**Unit name:** ${unit_name}\n**Doctrine:** *${doctrine}*\n**Level:** ${level}`,
    });
  },
};

//['aircraft carrier', 'aircraft transport', 'anti air', 'anti tank', 'armored car', 'artillery', 'attack bomber', 'battleship', 'commandos', 'cruiser', 'destroyer', 'flying bomb', 'heavy tank', 'infantry', 'interceptor', 'light tank', 'mechanized infantry', 'medium tank', 'militia', 'motorized infantry', 'naval bomber', 'nuclear bomber', 'nuclear rocket', 'paratroopers transport', 'paratroopers unit', 'railroadgun', 'rocket', 'rocket artillery', 'rocket fighter', 'sp anti air', 'sp artillery', 'sp rocket artillery', 'strategic bomber', 'submarine', 'tactical bomber', 'tank destroyer', 'transport ship']
