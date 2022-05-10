const getChatbox = (data) => {
  const { chatboxId, chatboxLabel, chatboxMessagesId, chatboxInputId } = data;
  const chatboxContainer = document.createElement("div");
  chatboxContainer.classList.add("chatbox_container");
  chatboxContainer.setAttribute("id", chatboxId);

  chatboxContainer.innerHTML = `
    <div class='chatbox_label_container'>
        <p class='chatbox_label'>${chatboxLabel}</p>
    </div>

    <div class='messages_container' id='${chatboxMessagesId}'></div>

    <div class='new_message_input_container'>
        <input class='new_message_input' id='${chatboxInputId}' placeholder="Type your message .."></input>
    </div>
  `;
  return chatboxContainer;
};

const getGroupChatMessage = (data) => {
  const { writer, message } = data;
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message_container");

  messageContainer.innerHTML = `
  <p class='message_paragraph'>
      <span class='message_author'>${writer}: </span>${message}
  </p>
  `;

  return messageContainer;
};

export default {
  getChatbox,
  getGroupChatMessage,
};
