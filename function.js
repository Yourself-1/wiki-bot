const { data } = require("./commands/unit");

function getRandomColor() {
  return Math.floor(Math.random() * 16777215);
}

module.exports = { getRandomColor };
