import { io } from "socket.io-client";

let socket;

export const initSocket = () => {
  if (!socket) {
    const URL =
      process.env.NODE_ENV === "production"
        ? "/"
        : "http://localhost:5000";

    socket = io(URL, {
      transports: ["websocket"],
      reconnectionAttempts: Infinity,
      timeout: 10000,
    });
  }
  return socket;
};