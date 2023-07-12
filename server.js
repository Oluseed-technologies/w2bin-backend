// modules import
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const AppError = require("./utils/AppError");
const App = require("./app");
const http = require("http");
const socket = require("socket.io");
const { protect } = require("./controllers/auth");

const server = http.createServer(App);

const io = socket(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  // io.engine.use(protect)
  const userId = socket.handshake.query.userId;

  io.use((socket, next) => {
    !userId ? next(new Error("Please provide the user ID")) : next();
  });

  socket.join(userId);

  socket.on("connect_error", (err) => {
    console.log(err.message); // prints the message associated with the error
  });

  socket.broadcast.emit("join-chat", {
    message: "A user joined the chat",
  });
  socket.emit("join-chat", {
    message: "You joined the chat",
  });

  socket.on("chat", (chat) => {
    console.log(chat);
    receivers = [...chat.receivers, userId];

    receivers?.forEach((id) => {
      console.log(id);
      io.to(id).emit("chat", chat);
    });
  });

  socket.on("disconnect", () => {
    console.log("Disconnected");
  });
  console.log("Connnected");
});

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(
        `server running at port ${process.env.PORT} with socket initallize`
      );
    });
  })
  .catch((err) => {
    throw new AppError(err.message, 500);
    console.log(err.message);
    process.exit(1);
  });
