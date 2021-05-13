const express = require("express")
const socket = require("socket.io")
const Rooms = require("./classes/Rooms")

const app = express()
const io = socket.listen(app.listen(8080))
app.use(express.static(__dirname + "/.."))

const players = {}
const rooms = new Rooms()

io.sockets.on("connection", client => {
  players[client.id] = client

  client.on("create", data => {
    const room = rooms.create(data, client)
    client.emit("created", { room })
  })

  client.on("connect", data => {
    if (rooms.hasRoom(data.room)) {
      const room = rooms.connect(data, client)
      const enemy = rooms.getRoomEnemySocket(room, client)

      const roomData = { min: room.min, max: room.max, roomID: room.id }

      client.emit("connected", roomData)
      enemy.emit("enemy-is-connected", roomData)
    } else {
      client.emit("connection-error", { message: "roo was not found" })
    }
  })

  client.on("guess-for-enemy", ({ number, room }) => {
    const { min, max } = rooms.getRoomByID(room)
    if (number && number > min && number < max) {
      rooms.makeGuessNumber(room, number, client)
    }
  })

})

app.post("/api/connect", (req, res) => {
  // получить { room: 23456 }
  // найти комнату по id
  // если есть комната
  // // добавить туда противника
  // // вызвать событие начало игры
  // // вернуть { min: 0, max: 100 }
})

app.post("/api/create-number", (req, res) => {
  // получить { number: 50 }
  // если 
})

app.post("/api/check-number", (req, res) => {
  // получить { number: 50 }
  // если число меньше загаданному число - вернуть смс что число меньше кол-во попыток
  // // { status: "less", gueeses: [50, 75, 87] }
  // если число больше загаданному число - вернуть смс что число больше кол-во попыток
  // // { status: "more", gueeses: [50, 75, 87, 80] }
  // если число равно загаданному число - завершить партию, вернуть кол-во попыток
  // // { status: "even", gueeses: [50, 75, 87, 80, 83, 85] }
})