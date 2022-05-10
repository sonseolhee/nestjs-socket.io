import socketHandler from "./socketHandler.js";
import store from "./store.js";
import ui from "./ui.js";

const nameInput = document.querySelector(".introduction_page_name_input");

nameInput.addEventListener("keyup", (event) => {
  console.log(event.target.value);
  // # set username
  store.setUsername(event.target.value);
});

const chatPageButton = document.getElementById("enter_chats_button");
chatPageButton.addEventListener("click", () => {
  // create groupchat box
  ui.goToChatPage();
  // connect to socket.io
  socketHandler.connectToSocketIoServer();
});
