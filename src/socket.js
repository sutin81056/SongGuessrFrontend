import { io } from "socket.io-client";
console.log("Backend URL:", process.env.REACT_APP_BACKEND_URL);

const socket = io(
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5000",
  {
    transports: ["websocket"],
  }
);

//const socket = io(process.env.REACT_APP_BACKEND_URL || "http://localhost:5000");

export default socket;
