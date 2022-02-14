const generateNumberID = (length = 16) =>
  parseInt(
    Math.ceil(Math.random() * Date.now())
      .toPrecision(length)
      .toString()
      .replace(".", "")
  );

const generateStringID = (length = 16) => {
  var id = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
};

const generateColor = () => {
  const color = Math.floor(Math.random() * 16777216);
  return "#" + color.toString(16);
};

const MESSAGE_TYPES = {
  CREATE_LOBBY: 1,
  JOIN_LOBBY: 2,
  SEND_MESSAGE: 3,
  LEAVE_LOBBY: 4,
  CHANGE_NAME: 5,
};

export { generateNumberID, generateStringID, generateColor, MESSAGE_TYPES };
