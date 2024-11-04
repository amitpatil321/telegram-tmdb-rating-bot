const axios = require("axios");

const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/`;

function getAxiosInstance() {
  return {
    get(method, params) {
      return axios.get(`/${method}`, {
        baseURL: BASE_URL,
        params,
      });
    },
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
          `https://api.themoviedb.org/3/search/movie?query=${params}&api_key=${process.env.TMDB_API_KEY}`
        );
      } catch (error) {
        return Promise.reject(error);
      }
    },
    getMovieById(id) {
      try {
        return axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}`
        );
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
}

// Immediately invoke getAxiosInstance to export the instance with get and post methods
module.exports = getAxiosInstance();
