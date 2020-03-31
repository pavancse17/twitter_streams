const Twitter = require("twitter");

/**
 * TweetsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

let twitter = new Twitter({
  consumer_key: sails.config.custom.TWITTER_API_KEY,
  consumer_secret: sails.config.custom.TWITTER_API_SECRET_KEY,
  access_token_key: sails.config.custom.TWITTER_ACCESS_TOKEN,
  access_token_secret: sails.config.custom.TWITTER_ACCESS_TOKEN_SECRET
});
let twitterStream;

const stream = (socket, searchTerm) => {
  if (searchTerm) {
    twitter.stream("statuses/filter", { track: searchTerm }, stream => {
      stream.on("data", tweet => {
        socket.emit("tweets", tweet);
      });

      stream.on("error", error => {
        console.log("Twitter streaming end point error:", error);
      });
      twitterStream = stream;
    });
  }
};

module.exports = {
  searchTweets: async function(req, res) {
    let socket = req.socket;
    if (twitterStream) {
      twitterStream.destroy();
    }
    stream(socket, req.query["q"]);
    socket.on("connection", () => console.log("Client connected"));
    socket.on("disconnect", () => console.log("Client disconnected"));
    return res.ok({ message: "tweets are successfully streaming at tweets" });
  }
};
