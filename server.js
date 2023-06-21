// modules import
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const AppError = require("./utils/AppError");
const App = require("./app");
// const { Server } = require("socket.io");
// const { createServer } = require("http");

const { init } = require("./socket");

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    const server = App.listen(process.env.PORT, () => {
      console.log(
        `server running at port ${process.env.PORT} with socket initallize`
      );
    });
    const io = init(server);

    io.on("connection", (socket) => {
      socket.on("message", (data) => {
        console.log(data);

        socket.emit("message", data);
      });

      console.log("a user is connected");
    });
  })
  .catch((err) => {
    throw new AppError(err.message, 500);
    console.log(err.message);
    process.exit(1);
  });
