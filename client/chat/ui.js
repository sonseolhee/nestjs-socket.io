import elements from "./elements.js";
import socketHandler from "./socketHandler.js";
import store from "./store.js";

const goToChatPage = () => {
  // introduction page box -> invisible
  const introductionPage = document.querySelector(".introduction_page");
  introductionPage.classList.add("display_none");

  // chat_page -> visible
  const chatPage = document.querySelector(".chat_page");
  chatPage.classList.remove("display_none");
  chatPage.classList.add("display_flex");

  const username = store.getUsername();
  const userLabel = document.querySelector(".username_label");
  userLabel.innerHTML = username;

  createGroupChatbox();
  createRoomChatbox();
};

const chatboxId = "group-chat-chatbox";
const chatboxLabel = "Group Chat";
const chatboxMessagesId = "group-chat-messages";
const chatboxInputId = "group-chat-input";

const createGroupChatbox = () => {
  const data = {
    chatboxId,
    chatboxLabel,
    chatboxMessagesId,
    chatboxInputId,
  };

  //group chat box created
  const chatbox = elements.getChatbox(data);
  const chatboxesContainer = document.querySelector(".chatboxes_container");
  chatboxesContainer.appendChild(chatbox);

  //append message in messages_container
  const newMessageInput = document.getElementById(data.chatboxInputId);
  newMessageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const data = {
        writer: store.getUsername(),
        message: event.target.value,
      };

      //send message through socket.io
      socketHandler.sendGroupChatMessage(data);
      newMessageInput.value = "";
    }
  });
};

const appendGroupChatMessage = (data) => {
  if (!data) return;

  const groupChatboxMessagesContainer =
    document.getElementById(chatboxMessagesId);

  const chatMessage = elements.getGroupChatMessage(data);
  groupChatboxMessagesContainer.appendChild(chatMessage);
};

const updateActiveChatboxes = (data) => {
  const { connectedPeers } = data;

  const userSocketId = store.getSocketId();

  connectedPeers.forEach((peer) => {
    const activeChatboxes = store.getActiveChatboxes();
    const activeChatbox = activeChatboxes.find(
      (chatbox) => peer.socketId === chatbox.socketId
    );
    if (!activeChatbox && peer.socketId !== userSocketId) {
      createNewUserChatbox(peer);
    }
  });
};

const createNewUserChatbox = (peer) => {
  const chatboxId = peer.socketId;
  const chatboxMessagesId = `${peer.socketId}-messages`;
  const chatboxInputId = `${peer.socketId}-input`;
  const data = {
    chatboxLabel: peer.username,
    chatboxId,
    chatboxMessagesId,
    chatboxInputId,
  };

  const chatbox = elements.getChatbox(data);

  //append new chatbox to the DOM
  const chatboxesContainer = document.querySelector(".chatboxes_container");
  chatboxesContainer.appendChild(chatbox);

  //register event listeners for chatbox - send message to others
  const newMessageInput = document.getElementById(chatboxInputId);

  newMessageInput.addEventListener("keydown", (event) => {
    const key = event.key;

    if (key === "Enter") {
      const author = store.getUsername();
      const messageContent = event.target.value;
      const receiverSocketId = peer.socketId;
      const authorSocketId = store.getSocketId();

      const data = {
        author,
        messageContent,
        receiverSocketId,
        authorSocketId,
      };

      socketHandler.sendDirectMessage(data);

      newMessageInput.value = "";
    }
  });

  const activeChatbox = store.getActiveChatboxes();
  const newActiveChatboxes = [...activeChatbox, peer];
  store.setActiveChatboxes(newActiveChatboxes);
};

const appendDirectChatMessage = (messageData) => {
  const { authorSocketId, author, messageContent, isAuthor, receiverSocketId } =
    messageData;

  const messagesContainer = isAuthor
    ? document.getElementById(`${receiverSocketId}-messages`)
    : document.getElementById(`${authorSocketId}-messages`);

  if (messagesContainer) {
    const data = {
      messageContent,
      alignRight: isAuthor ? true : false,
    };

    const message = elements.getDirectChatMessage(data);
    messagesContainer.appendChild(message);
  }
};

const removeChatboxOfDisconnectedPeer = (data) => {
  const { disconnected } = data;

  const activeChat = store.getActiveChatboxes();
  const removeDisconnectChatbox = activeChat.filter(
    (box) => box.socketId !== disconnected
  );
  store.setActiveChatboxes(removeDisconnectChatbox);

  // ChatboxId -> remove from HTML
  const chatbox = document.getElementById(disconnected);
  if (chatbox) {
    chatbox.parentElement.removeChild(chatbox);
  }
};

const createRoomChatbox = () => {
  const roomId = store.getRoomId();
  if (typeof roomId === "undefined") return;

  const chatboxLabel = roomId;
  const chatboxId = roomId;
  const chatboxMessagesId = `${roomId}-messages`;
  const chatboxInputId = `${roomId}-input`;

  const data = {
    chatboxLabel,
    chatboxId,
    chatboxMessagesId,
    chatboxInputId,
  };

  const chatbox = elements.getChatbox(data);
  const chatboxContainer = document.querySelector(".chatboxes_container");
  chatboxContainer.appendChild(chatbox);

  const newMessageInput = document.getElementById(chatboxInputId);
  newMessageInput.addEventListener("keydown", (event) => {
    const key = event.key;

    if (key === "Enter") {
      const writer = store.getUsername();
      const message = event.target.value;
      const authorSocketId = store.getSocketId();

      const data = {
        writer,
        message,
        authorSocketId,
        roomId,
      };

      // send message to socket.io server
      socketHandler.sendRoomMessage(data);
      newMessageInput.value = "";
    }
  });
};

const appendRoomChatMessage = (data) => {
  const { roomId } = data;
  const messages = document.getElementById(`${roomId}-messages`);
  messages.appendChild(elements.getGroupChatMessage(data));
};

export default {
  goToChatPage,
  updateActiveChatboxes,
  removeChatboxOfDisconnectedPeer,
  createNewUserChatbox,
  appendGroupChatMessage,
  appendDirectChatMessage,
  createRoomChatbox,
  appendRoomChatMessage,
};
