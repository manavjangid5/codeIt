import { io } from "socket.io-client";

export const initSocket = () => {
  const options = {
    forceNew: true,
    reconnectionAttempts: Infinity,
    timeout: 10000,
    transports: ["websocket"],
  };

  return io(options); // ✅ no URL needed
};
