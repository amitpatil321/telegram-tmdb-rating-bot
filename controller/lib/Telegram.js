const axiosInstance = require("./axios");
const stringSimilarity = require("string-similarity");

function sendMessage(messageObj, messageText) {
  if (messageObj) {
    return axiosInstance.get("sendMessage", {
      chat_id: messageObj.chat.id,
      text: messageText,
    });
  } else {
    console.error("Invalid message object or missing chat ID.", messageObj);
    return Promise.reject(
      new Error("Invalid message object or missing chat ID.")
    );
  }
}

async function handleMessage(messageObj) {
  const messageText = messageObj?.text || "";
  if (messageText.charAt(0) === "/") {
    const command = messageText.substr(1);
    switch (command) {
      case "start":
        return sendMessage(messageObj, "Hello! I'm a bot.");
      default:
        return sendMessage(messageObj, "Unknown command.");
    }
  } else {
    // Fetch movie data
    const movieInfo = await axiosInstance.getMovie(messageText);
    if (movieInfo?.status === 200 && movieInfo?.data?.total_results > 0) {
      const bestMatch = movieInfo.data.results.reduce(
        (best, movie) => {
          const similarity = stringSimilarity.compareTwoStrings(
            movie.title.toLowerCase(),
            messageText.toLowerCase()
          );
          return similarity > best.similarity ? { movie, similarity } : best;
        },
        { movie: null, similarity: 0 }
      );

      if (bestMatch.movie) {
        if (
          movieInfo.data &&
          movieInfo.data.results &&
          movieInfo.data.total_results > 0
        ) {
          const movie = movieInfo.data.results[0]; // Get the first movie from results
          const movieTitle = movie.original_title;
          const movieRating = movie.vote_average;
          const movieOverview = movie.overview;
          const posterPath = movie.poster_path; // Assuming this is available

          // Construct the full image URL
          const posterUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;

          // Prepare message with movie details
          const messageText = `*Title:* ${movieTitle}\n*IMDb Rating:* ${movieRating}\n\n*Overview:* ${movieOverview}`;

          // Send the message with movie details
          await sendMessage(messageObj, messageText, {
            parse_mode: "Markdown",
          });

          // Send the movie poster as a photo
          return sendPhoto(messageObj, posterUrl);
        }
      } else {
        return sendMessage(messageObj, movieInfo.data.results[0]);
      }
    }
    return sendMessage(
      messageObj,
      "No details found, make sure you typed the correct name"
    );
  }
}

// Send a formatted text message
async function sendMessage(messageObj, text, options = {}) {
  const chatId = messageObj.chat.id;
  return axiosInstance.post("sendMessage", {
    chat_id: chatId,
    text: text,
    ...options, // Spread options to include parse_mode
  });
}

// Send a photo to the chat
async function sendPhoto(messageObj, photoUrl) {
  const chatId = messageObj.chat.id;
  return axiosInstance.post("sendPhoto", {
    chat_id: chatId,
    photo: photoUrl,
  });
}

module.exports = { handleMessage, sendMessage, sendPhoto };
