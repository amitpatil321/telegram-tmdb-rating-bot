const axiosInstance = require("./axios");
const stringSimilarity = require("string-similarity");
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

async function handleMessage(messageObj) {
  const messageText = messageObj?.text || "";
  if (messageText.charAt(0) === "/") {
    const command = messageText.substr(1);
    switch (command) {
      case "start":
        sendMessage(
          messageObj,
          `Hello! 🎬 Some say I'm better than Google for movie ratings… Okay, nobody says that, but give me a shot anyway!`,
          { parse_mode: "Markdown" }
        );
        return sendMessage(messageObj, `Enter movie name and press enter`);
      default:
        return sendMessage(messageObj, `Unknown command`);
    }
  } else {
    const movieInfo = await axiosInstance.getMovie(messageText);
    if (movieInfo?.status === 200 && movieInfo?.data?.total_results) {
      if (movieInfo?.data?.total_results > 1) {
        const movieOptions = movieInfo.data.results
          .filter((movie) => movie.title && movie.release_date) // Ensure title and release_date exist
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
            "Please select anticipated movie",
            {
              reply_markup: {
                inline_keyboard: [...movieOptions],
              },
            }
          );
        }
      } else await sendDetails(messageObj, movieInfo?.data?.results[0]);
    } else {
      return sendMessage(
        messageObj,
        "No movies found with given title, Make sure you have typed it correctly"
      );
    }
  }
}

// function sendMessage(messageObj, messageText) {
//   if (messageObj) {
//     return axiosInstance.get("sendMessage", {
//       chat_id: messageObj.chat.id,
//       text: messageText,
//     });
//   } else {
//     return Promise.reject(
//       new Error("Invalid message object or missing chat ID.")
//     );
//   }
// }

// Send a formatted text message
async function sendMessage(messageObj, text, options = {}) {
  const chatId = messageObj.chat.id;
  return axiosInstance.post("sendMessage", {
    chat_id: chatId,
    text: text,
    ...options,
  });
}

async function sendPhoto(messageObj, photoUrl) {
  const chatId = messageObj.chat.id;
  return axiosInstance.post("sendPhoto", {
    chat_id: chatId,
    photo: photoUrl,
  });
}

async function sendDetails(messageObj, movie) {
  let messageText = `*Title:* ${movie?.original_title}
*IMDb Rating:* ${movie?.vote_average.toFixed(1) || "NA"}
*Release Date:* ${movie.release_date.split("-")[0]}
*Adult:* ${movie?.adult}
*Genres:* ${movie?.genres?.map((each) => each?.name).join(", ")}`;
  await sendMessage(messageObj, messageText, { parse_mode: "Markdown" });
  if (movie?.poster_path) {
    const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    await sendPhoto(messageObj, posterUrl);
  }
}

bot.on("callback_query", async (callbackQuery) => {
  const movieId = callbackQuery.data;
  const messageObj = callbackQuery.message;
  try {
    const movieDetail = await axiosInstance.getMovieById(movieId);
    const movie = movieDetail.data;
    await sendDetails(messageObj, movie);
  } catch (error) {
    await sendMessage(messageObj, "Failed to fetch movie details.");
  }

  bot.answerCallbackQuery(callbackQuery.id);
});

bot.on("message", (messageObj) => {
  handleMessage(messageObj);
});

module.exports = { handleMessage, sendMessage, sendPhoto };
