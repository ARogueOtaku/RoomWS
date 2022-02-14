const connection = new WebSocket("ws://localhost:6969");
const joinButton = document.getElementById("join");
const createButton = document.getElementById("create");
const leaveButton = document.getElementById("leave");
const sendButton = document.getElementById("send");
const changeNameButton = document.getElementById("chnagename");
const nameInput = document.getElementById("name");
const lobbyidInput = document.getElementById("lobbyid");
const messageInput = document.getElementById("message");
const messagesDisplay = document.getElementById("messages");
let lastsentID = "";
let lastMessageElement = null;
let name = "";

const showMessage = (from, text) => {
  const textElement = document.createElement("div");
  textElement.classList.add("text");
  const dataElement = document.createElement("span");
  dataElement.classList.add("data");
  const timeElement = document.createElement("em");
  timeElement.classList.add("time");
  timeElement.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  dataElement.textContent = text;
  textElement.appendChild(dataElement);
  textElement.appendChild(timeElement);
  if (from.id + "" === lastsentID + "") {
    lastMessageElement.appendChild(textElement);
  } else {
    const messageElement = document.createElement("div");
    const fromElement = document.createElement("strong");
    messageElement.appendChild(fromElement);
    fromElement.textContent = from.name + (["Me", "Server", "Client"].includes(from.name) ? "" : `#${from.id}`);
    fromElement.style.color = from.color ?? "gray";
    messageElement.appendChild(textElement);
    messageElement.classList.add("message");
    messageElement.style.borderColor = from.color ?? "gray";
    messagesDisplay.appendChild(messageElement);
    lastMessageElement = messageElement;
    lastsentID = from.id;
  }
};

connection.addEventListener("message", (payload) => {
  console.log(payload.data);
  const { from, text } = JSON.parse(payload.data);
  showMessage(from, text);
});

createButton.addEventListener("click", (e) => {
  console.log("Creating");
  connection.send(JSON.stringify({ type: 1, payload: "" }));
});

joinButton.addEventListener("click", (e) => {
  console.log("Joining");
  connection.send(JSON.stringify({ type: 2, payload: lobbyidInput.value.trim() }));
});

changeNameButton.addEventListener("click", (e) => {
  console.log("Changing");
  name = nameInput.value.trim();
  connection.send(JSON.stringify({ type: 5, payload: nameInput.value.trim() }));
});

leaveButton.addEventListener("click", (e) => {
  console.log("Leaving");
  connection.send(JSON.stringify({ type: 4, payload: "" }));
});

sendButton.addEventListener("click", (e) => {
  if (messageInput.value.trim().length === 0) {
    showMessage({ name: "Client", id: "2" }, "Enter a Message!");
    return;
  }
  console.log("Sending");
  connection.send(JSON.stringify({ type: 3, payload: messageInput.value.trim() }));
  messageInput.value.trim() = "";
});
