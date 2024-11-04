const axiosInstance = require("../../api/bot.api");
const utils = require("../../utils/utils");
const stringSimilarity = require("string-similarity");
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

async function handleMessage(messageObj) {
  const messageText = messageObj?.text || "";
  if (messageText.charAt(0) === "/") {
    const command = messageText.substr(1);
    utils.handleCommands(messageObj, command);
  } else {
    const movieInfo = await axiosInstance.getMovie(messageText);
    if (movieInfo?.status === 200 && movieInfo?.data?.total_results) {
      // if there are multiple results then list top 5 results as options
      if (movieInfo?.data?.total_results > 1) {
        const movieOptions = movieInfo.data.results
          .filter((movie) => movie.title && movie.release_date)
          .slice(0, 5)
          .map((movie) => [
            {
              text: `${movie.title} (${movie.release_date.split("-")[0]})`, // Display year only for clarity
              callback_data: movie.id.toString(),
            },
          ]);

        if (movieOptions.length > 0) {
          bot.sendMessage(
            messageObj.chat.id,
            "Which one did you have in mind?",
            {
              reply_markup: {
                inline_keyboard: [...movieOptions],
              },
            }
          );
        }
      } else {
        // if there is only one movie, then directly print movie details
        await utils.sendDetails(messageObj, movieInfo?.data?.results[0]);
      }
    } else {
      return utils.sendMessage(
        messageObj,
        "No movies found with that title. Double-check the spelling, and let's try again!"
      );
    }
  }
}

bot.on("callback_query", async (callbackQuery) => {
  const { data: movieId, message: messageObj } = callbackQuery;
  try {
    const movieDetail = await axiosInstance.getMovieById(movieId);
    const movie = movieDetail.data;
    await utils.sendDetails(messageObj, movie);
  } catch (error) {
    await utils.sendMessage(messageObj, "Failed to fetch movie details.");
  }

  bot.answerCallbackQuery(callbackQuery.id);
});

bot.on("message", (messageObj) => {
  handleMessage(messageObj);
});

module.exports = { handleMessage };
