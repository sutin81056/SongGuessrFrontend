import { io } from "socket.io-client";

const socket = io(
  process.env.REACT_APP_BACKEND_URL ||
    "courteous-exploration-production.up.railway.app"
);
//const socket = io(process.env.REACT_APP_BACKEND_URL || "http://localhost:5000");

export default socket;
