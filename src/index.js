import express from "express";
import {matchRouter} from "./routes/matches.js";
import * as http from "node:http";
import {attachWebsocketServer} from "./ws/server.js";

const app = express();
const server = http.createServer(app)
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || "0.0.0.0";

app.use(express.json());
app.use("/matches", matchRouter)

const { broadcastMatchCreated } = attachWebsocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(PORT, HOST, ()=> {
  const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`
  console.log(`Listening on port ${baseUrl}`)
  console.log(`websocket server is running on ${baseUrl.replace("http", "ws" )}/ws`)
} )


