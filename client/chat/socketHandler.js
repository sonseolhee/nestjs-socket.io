import store from "./store.js";
import ui from "./ui.js";

let socket = null;

const connectToSocketIoServer = () => {
  socket = io("http://localhost:80");

  socket.on("connect", () => {
    console.log(socket.id);

    // # set socket id
    store.setSocketId(socket.id);
    registerActiveSession();
  });

  socket.on("group-chat-message", (data) => {
    console.log("groupchat", data);
    ui.appendGroupChatMessage(data);
  });

  socket.on("active-peers", (data) => {
    ui.updateActiveChatboxes(data);
  });

  socket.on("peer-disconnected", (data) => {
    ui.removeChatboxOfDisconnectedPeer(data);
  });

  socket.on("direct-chat-message", (data) => {
    ui.appendDirectChatMessage(data);
  });

  socket.on("room-message", (data) => {
    ui.appendRoomChatMessage(data);
  });
};

const registerActiveSession = () => {
  const userData = {
    username: store.getUsername(),
    roomId: store.getRoomId(),
  };
  socket.emit("register-new-user", userData);
};

// # Group-chat
const sendGroupChatMessage = (data) => {
  socket.emit("group-chat-message", data);
};

// # Direct-chat
const sendDirectMessage = (data) => {
  socket.emit("direct-chat-message", data);
};

// # Room-chat
const sendRoomMessage = (data) => {
  socket.emit("room-message", data);
};

export default {
  connectToSocketIoServer,
  sendGroupChatMessage,
  sendDirectMessage,
  sendRoomMessage,
};
