const { SlashCommandBuilder } = require("discord.js");
const { getRandomColor } = require("../function.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Tells information of the discord account of a person")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want info about")
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const guildMember = interaction.options.getMember("user");

    const content = {
      color: getRandomColor(),
      title: "Account Info",
      description: `Info about ${user.toString()} ${user.bot ? ":robot:" : ""}`,
      thumbnail: {
        url: user.displayAvatarURL(),
      },
      fields: [
        {
          name: `${user.bot ? "**BOT**" : "\u200b"}`,
          value: "",
        },
        {
          name: "Username:",
          value: user.username,
        },
        {
          name: "Tag:",
          value: user.tag,
        },
        {
          name: "Id:",
          value: `||${user.id.toString()}||`,
        },
        {
          name: "Date of creation:",
          value: new Date(user.createdAt).toUTCString(),
        },
        {
          name: "\u200b",
          value: "",
        },
        {
          name: "Server Nickname:",
          value:
            guildMember.nickname === null
              ? user.username
              : guildMember.nickname,
        },
        {
          name: "Joined server at:",
          value: new Date(guildMember.joinedAt).toUTCString(),
        },
        {
          name: "\u200b",
          value: `[Link to avatar](${user.displayAvatarURL()} \'Press to open image in new page\')`,
        },
      ],
    };

    await interaction.reply({ embeds: [content], ephemeral: true });
  },
};
