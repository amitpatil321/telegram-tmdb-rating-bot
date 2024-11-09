const axiosInstance = require("../api/bot.api");

module.exports = {
  handleCommands(messageObj, command) {
    switch (command) {
      case "start":
        return this.sendMessage(
          messageObj,
          `Welcome *${messageObj?.from?.first_name}* 🍿, Ready to find out if your next pick is a blockbuster or a flop? Let's dive into the world of ratings! \n\n Enter movie name and press enter`,
          { parse_mode: "Markdown" }
        );
      default:
        return this.sendMessage(messageObj, `Unknown command`);
    }
  },
  async sendMessage(messageObj, text, options = {}) {
    const chatId = messageObj.chat.id;
    return axiosInstance.post("sendMessage", {
      chat_id: chatId,
      text: text,
      ...options,
    });
  },
  async sendPhoto(messageObj, photoUrl) {
    const chatId = messageObj.chat.id;
    return axiosInstance.post("sendPhoto", {
      chat_id: chatId,
      photo: photoUrl,
    });
  },
  async sendDetails(messageObj, movie) {
    if (messageObj) {
      let messageText = `*Title:* ${movie?.original_title}
  *IMDb Rating:* ${movie?.vote_average.toFixed(1) || "NA"}
  *Release Date:* ${movie.release_date.split("-")[0]}
  *Genres:* ${movie?.genres?.map((each) => each?.name).join(", ")}`;
      await this.sendMessage(messageObj, messageText, {
        parse_mode: "Markdown",
      });
      if (movie?.poster_path) {
        const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        await this.sendPhoto(messageObj, posterUrl);
      }
    } else this.sendMessage(messageObj, `Unexpected error!`);
  },
};
