const { errorHttp } = require("./errorHandler");

function cekApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];


  if (!process.env.API_KEY || apiKey !== process.env.API_KEY) {
    return next(errorHttp(401, "API key tidak valid"));
  }

  next();
}

module.exports = cekApiKey;