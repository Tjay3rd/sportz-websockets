import {WebSocketServer, WebSocket} from "ws";

const wss = new WebSocketServer({port: 8080})

  //readyState
  //1.CONNECTING
  //2.OPEN *the only state where you can safely send messages .send()*
  //3.CLOSING
  //4.CLOSED

//Connection Event
wss.on("connection", (socket, request) => {

  const ip = request.socket.remoteAddress

  socket.on("message", (rawData) => {
   const message = rawData.toString()
    console.log({rawData})
    console.log(message)
    wss.clients.forEach((client) => {

      //if(client.readyState===1) client.send(`Broadcast to All Clients: ${message}`)
      if(client.readyState===WebSocket.OPEN && client !== socket) {
        client.send(`${message}`)
      }
      else console.log(`Skipped the send code block for some reason`)
    })
  })
  socket.on("error", (err) => {
    console.error(`Error, ${err.message}: ${ip}`)
  });
  socket.on("close", () => {
    console.log("Disconnected")
  });
})

console.log("Websocket Server is Live on ws://localhost:8080")