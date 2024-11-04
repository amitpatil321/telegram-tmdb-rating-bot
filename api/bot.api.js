const axios = require("axios");
const CONSTANTS = require("../config/constants");

const BASE_URL = `${CONSTANTS.TELEGRAM_API_BASE}${process.env.TELEGRAM_TOKEN}/`;

function getAxiosInstance() {
  return {
    post(method, params) {
      return axios({
        method: "post",
        baseURL: BASE_URL,
        url: `/${method}`,
        params,
      });
    },
    getMovie(params) {
      try {
        return axios.get(
          `${CONSTANTS.MOVIE_API_BASE}search/movie?query=${params}&api_key=${process.env.TMDB_API_KEY}`
        );
      } catch (error) {
        return Promise.reject(error);
      }
    },
    getMovieById(id) {
      try {
        return axios.get(
          `${CONSTANTS.MOVIE_API_BASE}movie/${id}?api_key=${process.env.TMDB_API_KEY}`
        );
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
}

// Immediately invoke getAxiosInstance to export the instance with get and post methods
module.exports = getAxiosInstance();
