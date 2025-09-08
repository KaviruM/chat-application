const ws = require("ws")

const server = new ws.Server({ port: 3001 })

server.on("connection", client => {
  console.log("Client connected")
  
  client.on("message", message => {
    const data = JSON.parse(message)

    if (data.type === "connect") {
      client.id = Date.now()
      client.name = data.name
      client.send(JSON.stringify({
        type: "connect-done",
        name: client.name,
        id: client.id
      }))
      console.log(`${client.name} connected with ID: ${client.id}`)
    } else if (data.type === "message") {
      const clients = Array.from(server.clients)
      const match = clients.find(item => (
        item.id === data.destination
      ))
      if (match) {
        console.log(`Message from ${client.name} to ${match.name}`)
        match.send(JSON.stringify({
          type: "message",
          text: data.text,
          source: {
            id: client.id,
            name: client.name
          }
        }))
      } else {
        console.log(`Destination ID ${data.destination} not found`)
      }
    }
  })
  
  client.on("close", () => {
    console.log(`Client ${client.name} disconnected`)
  })
})

console.log("Server running on port 3001")