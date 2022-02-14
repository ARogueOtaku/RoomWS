# A Barebone Anonymous Chat Application

A Simple Chat App that uses basic WebSocket Server to implement a Lobby like Feature and Allow chatting.

- There is no databases involved, hence nothing is stored cold.
- No History is maintained and no user tracking is done.
- User enters their name and either create a lobby or join one.
- Lobbies are Purged once all users leave.

No Live Demo is available. Sorry. You will need to clone the repo and configure the server yourselves.

**Steps:**

- Run `npm start` from the `backend` folder to Start the Server.
- Make sure to inject proper environment variables.
- A rudimentary `UI` is provied in the `frontend` folder. If you want to use that, make sure to change the Server Port(if using one) when establishing a connection.
