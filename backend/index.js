//Necessary Imports
import env from "dotenv";
import express from "express";
import { WebSocketServer } from "ws";
import { generateNumberID, generateStringID, generateColor, MESSAGE_TYPES } from "./util.js";

//Server Setup Stuff
env.config();
const app = express();
const lobbies = [{ lobbyID: "dummy", users: [{ currentLobby: null, name: "dummyuser", id: "1", connection: null }] }];

//Methods used
//Send to Client
const sendToUser = (userDetails, payload) => {
  userDetails.connection.send(JSON.stringify(payload));
};

//Broadcast to Lobby
const broadcastToLobby = (userDetails, lobby, payload, excludeSelf = false) => {
  lobby.users.forEach((user) => {
    if (user.id === userDetails.id && !excludeSelf) {
      const modifiedPayload = JSON.parse(JSON.stringify(payload));
      modifiedPayload.from.name = "Me";
      modifiedPayload.from.id = "self";
      modifiedPayload.from.color = "#000";
      sendToUser(user, modifiedPayload);
    } else if (user.id !== userDetails.id) sendToUser(user, payload);
  });
};

//Create a new Lobby with host details
const createLobby = (hostDetails) => {
  if (hostDetails.name.length === 0)
    sendToUser(hostDetails, { from: { name: "Server", id: 1 }, text: `Please Enter a Name` });
  else if (hostDetails.currentLobby)
    sendToUser(hostDetails, { from: { name: "Server", id: 1 }, text: `Already in a Lobby. Leave first!` });
  else {
    const newLobby = { lobbyID: generateStringID(5), users: [hostDetails] };
    lobbies.push(newLobby);
    hostDetails.currentLobby = newLobby;
    hostDetails.color = generateColor();
    sendToUser(hostDetails, { from: { name: "Server", id: 1 }, text: `Lobby Created. ID: ${newLobby.lobbyID}` });
  }
};

//Join a Lobby with Lobby ID
const joinLobby = (userDetails, lobbyID) => {
  if (userDetails.name.length === 0)
    sendToUser(userDetails, { from: { name: "Server", id: 1 }, text: `Please Enter a Name` });
  else if (userDetails.currentLobby)
    sendToUser(userDetails, { from: { name: "Server", id: 1 }, text: `Already in a Lobby. Leave first!` });
  else {
    const foundLobby = lobbies.find((lobby) => lobby.lobbyID === lobbyID);
    if (!foundLobby) sendToUser(userDetails, { from: { name: "Server", id: 1 }, text: `No Lobbies found!` });
    else {
      foundLobby.users.push(userDetails);
      userDetails.currentLobby = foundLobby;
      userDetails.color = generateColor();
      sendToUser(userDetails, { from: { name: "Server", id: 1 }, text: `Lobby ${foundLobby.lobbyID} Joined.` });
      broadcastToLobby(
        userDetails,
        foundLobby,
        {
          from: { name: "Server", id: 1 },
          text: `${userDetails.name}#${userDetails.id} has Joined the Lobby.`,
        },
        true
      );
    }
  }
};

//Leave Lobby
const leaveLobby = (userDetails) => {
  if (userDetails.currentLobby) {
    const currentLobby = userDetails.currentLobby;
    const userIndexInLobby = currentLobby.users.findIndex((user) => user.id === userDetails.id);
    currentLobby.users.splice(userIndexInLobby, 1);
    userDetails.currentLobby = null;
    sendToUser(userDetails, { from: { name: "Server", id: 1 }, text: `Lobby Left!` });
    broadcastToLobby(
      userDetails,
      currentLobby,
      {
        from: { name: "Server", id: 1 },
        text: `${userDetails.name}#${userDetails.id} has left the Lobby.`,
      },
      true
    );
    if (currentLobby.users.length === 0) {
      const lobbyIndex = lobbies.findIndex((lobby) => lobby.lobbyID === currentLobby.lobbyID);
      lobbies.splice(lobbyIndex, 1);
      console.log(`All users left. Lobby ${currentLobby.lobbyID} purged!`);
    }
  } else sendToUser(userDetails, { from: { name: "Server", id: 1 }, text: `Join a Lobby first!` });
};

//Send Message to Lobby
const sendMessage = (userDetails, message) => {
  if (!userDetails.currentLobby)
    sendToUser(userDetails, {
      from: { name: "Server", id: 1 },
      text: `Your message was not sent. Join a Lobby first!`,
    });
  else
    broadcastToLobby(userDetails, userDetails.currentLobby, {
      from: { name: userDetails.name, id: userDetails.id, color: userDetails.color },
      text: message,
    });
};

//Handle Client Messages
const handleUserMessage = (userDetails, type, payload) => {
  switch (type) {
    case MESSAGE_TYPES.CREATE_LOBBY:
      createLobby(userDetails);
      break;

    case MESSAGE_TYPES.JOIN_LOBBY:
      joinLobby(userDetails, payload);
      break;

    case MESSAGE_TYPES.SEND_MESSAGE:
      sendMessage(userDetails, payload);
      break;

    case MESSAGE_TYPES.LEAVE_LOBBY:
      leaveLobby(userDetails);
      break;

    case MESSAGE_TYPES.CHANGE_NAME:
      if (["me", "server", "client"].includes(payload.toLowerCase())) {
        sendToUser(userDetails, { from: { name: "Server", id: 1 }, text: `Invalid name.` });
      } else {
        userDetails.name = payload;
        sendToUser(userDetails, { from: { name: "Server", id: 1 }, text: `Name changed to: ${userDetails.name}` });
      }
      break;
  }
};

//Initialize the HTTP Server and Wrap it in a Websocket Sever
const server = app.listen(process.env.SERVER_PORT, (err) => {
  if (err) console.log(err);
  else console.log(`Server Listening on PORT: ${process.env.SERVER_PORT}`);
});
const wsServer = new WebSocketServer({ server });

//Handle Connections
wsServer.on("connection", (connection) => {
  const userDetails = { currentLobby: false, name: "", id: generateNumberID(6), connection };
  sendToUser(userDetails, { from: { name: "Server", id: 1 }, text: `Connected` });
  connection.on("message", (data) => {
    const { type, payload } = JSON.parse(data);
    handleUserMessage(userDetails, type, payload);
  });
});
