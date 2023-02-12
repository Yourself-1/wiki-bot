const { SlashCommandBuilder } = require("discord.js");

function getRandomColor() {
  return Math.floor(Math.random() * 16777215);
}
function unpack(whole_data, level, make_to_number = false) {
  data = whole_data.split("/")[level - 1];
  data = data.split(",");
  if (make_to_number) {
    number_data = [];
    for (let i in data) {
      number_data.push(parseFloat(data[i]));
    }
    return number_data;
  } else {
    return data;
  }
}

function makeToFloat(whole_data) {
  data = whole_data.split(",");
  float_data = [];
  for (let i in data) {
    float_data.push(parseFloat(data[i]));
  }
  return float_data;
}

var usedCommandrecently = []; //for implementing the command cooldown

const sql = require("sqlite3");

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

    if (choices === ["Please enter more letters"])
      await interaction.respond(
        choices.map((choice) => ({ name: choice, value: "aircraft carrier" }))
      );
    else
      await interaction.respond(
        choices.map((choice) => ({ name: choice, value: choice }))
      );
  },
  async execute(interaction) {
    const unit_name = interaction.options.getString("unit").toLowerCase();
    const doctrine = interaction.options.getString("doctrine").toLowerCase();
    var level = parseInt(interaction.options.getString("level"));
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

    if (!["base", "allies", "axis", "commintern", "pa"].includes(doctrine)) {
      doctrine = "base";
    }

    let db = new sql.Database("./data/units.db", sql.OPEN_READONLY);

    sql_command = "SELECT * FROM units WHERE unit = (?)";
    db.get(sql_command, unit_name, (err, row) => {
      if (err) throw err;
      max_level = row.max_level;
      if (level > max_level) {
        level = max_level;
      } else if (level < 1) {
        level = 1;
      }
      attack_defense_ratio = makeToFloat(row.attack_defense_ratio);
      level_of_building = parseInt(
        parseFloat(row.level_of_building.split(",")[level - 1])
      );

      unit_type = row.unit_type;
      eval(
        `min_production_time = makeToFloat(row.min_production_time_${doctrine})[level-1]`
      );
      eval(`defence = unpack(row.defence_${doctrine}, level, true)`);
      eval(`attack = unpack(row.attack_${doctrine}, level, true)`);
      eval(
        `terrain_combat_modifier = makeToFloat(row.terrain_combat_modifier_${doctrine})`
      );
      eval(`hitpoints = row.hitpoints_${doctrine}.split(",")[level-1]`);
      eval(`speed = makeToFloat(row.speed_${doctrine})[level-1]`);
      eval(`terrain_speed_modifier = row.terrain_speed_modifier_${doctrine}`);
      if (terrain_speed_modifier[0] === ",")
        terrain_speed_modifier = "0" + terrain_speed_modifier;

      terrain_speed_modifier = makeToFloat(terrain_speed_modifier);

      eval(
        `day_available = parseInt(row.day_available_${doctrine}.split(",")[level-1])`
      );
      eval(`cost = unpack(row.cost_${doctrine}, level)`);
      eval(`daily_cost = unpack(row.daily_cost_${doctrine}, level)`);

      url_number = 0;
      if (doctrine === "axis") url_number = 1;
      else if (doctrine === "allies") url_number = 2;
      else if (doctrine === "commintern") url_number = 3;
      else if (doctrine === "pa") url_number = 4;

      thumbnail_url = `https://www.callofwar.com/clients/ww2-client-ultimate/ww2-client-ultimate_live/images/factions/${url_number}_s6.png?58f1da`;
      if (doctrine === "base") {
        thumbnail_url =
          "https://lh6.googleusercontent.com/-_ASksv5DrxQ/TyQ6X4zG_7I/AAAAAAAAECg/WmVfMzj9l3Y/s1600/transparent.png";
      }

      const embed = {
        color: getRandomColor(),
        title: "**" + unit_name.toUpperCase() + "**",
        url: "https://wiki.callofwar.com/wiki/UNITS",
        author: {
          name: "wiki bot",
          icon_url:
            "https://cdn.discordapp.com/avatars/1063094701047156787/8675822a4a3d20605946280810952e20.webp",
        },
        thumbnail: {
          url: thumbnail_url,
        },
        fields: [
          {
            name: "__**GENERAL INFO-**__",
            value: `**Unit:** ${unit_name}
            **Doctrine:** ${doctrine === "pa" ? "pan-asian" : doctrine}
            **Level:** lvl ${level}
            **Day available (for research):** ${day_available}
            
            **Maximum level possible:** lvl ${max_level}
            **Type of unit:** ${unit_type} unit`,
          },
          {
            name: "\u200b",
            value: "\u200b",
          },
          {
            name: "__**COMBAT**__",
            value: `**Attack:Defense ratio**: ${attack_defense_ratio[0]} **:** ${attack_defense_ratio[1]}
            **Hitpoints:** ${hitpoints}`,
          },
          {
            name: "**Attack stats**",
            value: `Damage against following armour classes-
            **unarmored:** ${attack[0]}
            **light armored:** ${attack[1]}
            **heavy armored:** ${attack[2]}
            **air:** ${attack[3]}
            **ship:** ${attack[4]}
            **submarine:** ${attack[5]}
            **building:** ${attack[6]}
            **morale:** ${attack[7]}`,
            inline: true,
          },
          {
            name: "**Defence stats**",
            value: `Damage against following armour classes-
            **unarmored:** ${defence[0]}
            **light armored:** ${defence[1]}
            **heavy armored:** ${defence[2]}
            **air:** ${defence[3]}
            **ship:** ${defence[4]}
            **submarine:** ${defence[5]}
            **building:** ${defence[6]}`,
            inline: true,
          },
          {
            name: "\u200b",
            value: "\u200b",
          },
          {
            name: "**Terrain combat buffs**",
            value: `**Plains:** ${
              terrain_combat_modifier[0] === 0
                ? "NA"
                : parseInt((terrain_combat_modifier[0] - 1) * 100 + 0.04) + "%"
            }
            **Hills:** ${
              terrain_combat_modifier[1] === 0
                ? "NA"
                : parseInt((terrain_combat_modifier[1] - 1) * 100 + 0.04) + "%"
            }
            **Mountain:** ${
              terrain_combat_modifier[2] === 0
                ? "NA"
                : parseInt((terrain_combat_modifier[2] - 1) * 100 + 0.04) + "%"
            }
            **Forest:** ${
              terrain_combat_modifier[3] === 0
                ? "NA"
                : parseInt((terrain_combat_modifier[3] - 1) * 100 + 0.04) + "%"
            }
            **Urban:** ${
              terrain_combat_modifier[4] === 0
                ? "NA"
                : parseInt((terrain_combat_modifier[4] - 1) * 100 + 0.04) + "%"
            }`,
          },
          {
            name: "\u200b",
            value: "\u200b",
          },
          {
            name: "__**PRODUCTION & COST**__",
            value: `**Minimum production time**: ${min_production_time} hrs
            **Level of building for minimum production time:** lvl ${level_of_building}`,
          },
          {
            name: "**Cost (of production)**",
            value: `**Food:** ${cost[0]}
            **Goods:** ${cost[1]}
            **Metal:** ${cost[2]}
            **Oil:** ${cost[3]}
            **Rare:** ${cost[4]}
            **Manpower:** ${cost[5]}
            **Money:** ${cost[6]}`,
            inline: true,
          },
          {
            name: "**Upkeep**",
            value: `**Food:** ${daily_cost[0]}
            **Goods:** ${daily_cost[1]}
            **Metal:** ${daily_cost[2]}
            **Oil:** ${daily_cost[3]}
            **Rare:** ${daily_cost[4]}
            **Manpower:** ${daily_cost[5]}
            **Money:** ${daily_cost[6]}`,
            inline: true,
          },
          {
            name: "\u200b",
            value: "\u200b",
          },
          {
            name: "__**SPEED**__",
            value: `Base speed: ${speed}`,
          },

          {
            name: "**Speed per Terrain**",
            value: `**Plains:** ${
              terrain_speed_modifier[0] === 0
                ? "NA"
                : parseInt((terrain_speed_modifier[0] - 1) * 100) +
                  "% **(" +
                  parseInt(speed * terrain_speed_modifier[0]) +
                  ")**"
            }
            **Hills:** ${
              terrain_speed_modifier[1] === 0
                ? "NA"
                : parseInt((terrain_speed_modifier[1] - 1) * 100) +
                  "% **(" +
                  parseInt(speed * terrain_speed_modifier[1]) +
                  ")**"
            }
            **Mountain:** ${
              terrain_speed_modifier[2] === 0
                ? "NA"
                : parseInt((terrain_speed_modifier[2] - 1) * 100) +
                  "% **(" +
                  parseInt(speed * terrain_speed_modifier[2]) +
                  ")**"
            }
            **Forest:** ${
              terrain_speed_modifier[3] === 0
                ? "NA"
                : parseInt((terrain_speed_modifier[3] - 1) * 100) +
                  "% **(" +
                  parseInt(speed * terrain_speed_modifier[3]) +
                  ")**"
            }
            **Urban:** ${
              terrain_speed_modifier[4] === 0
                ? "NA"
                : parseInt((terrain_speed_modifier[4] - 1) * 100) +
                  "% **(" +
                  parseInt(speed * terrain_speed_modifier[4]) +
                  ")**"
            }`,
          },
        ],
        footer: {
          text: "If you find any error or incorrect information, join the server and make a ticket - https://discord.gg/R8TcR9MhMK",
        },
      };

      interaction.editReply({ embeds: [embed] });
      db.close();
    });
  },
};

//['aircraft carrier', 'aircraft transport', 'anti air', 'anti tank', 'armored car', 'artillery', 'attack bomber', 'battleship', 'commandos', 'cruiser', 'destroyer', 'flying bomb', 'heavy tank', 'infantry', 'interceptor', 'light tank', 'mechanized infantry', 'medium tank', 'militia', 'motorized infantry', 'naval bomber', 'nuclear bomber', 'nuclear rocket', 'paratroopers transport', 'paratroopers unit', 'railroadgun', 'rocket', 'rocket artillery', 'rocket fighter', 'sp anti air', 'sp artillery', 'sp rocket artillery', 'strategic bomber', 'submarine', 'tactical bomber', 'tank destroyer', 'transport ship']
//console
