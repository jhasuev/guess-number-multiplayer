module.exports = class Rooms {
  constructor() {
    this.init()
  }

  get nextID() {
    return this.rooms.reduce((id, room) => Math.max(id, room.id), 0) + 1
  }

  init() {
    this.rooms = []
  }

  create({ min, max }, socket) {
    const id = this.nextID
    this.rooms.push({
      id,
      min,
      max,
      users: [ { socket, id: 1 } ],
      game: [],
    })

    return id
  }

  connect(data, socket) {
    const room = this.getRoomByID(data.room)
    room.users.push({ socket, id: 2 })
    return room
  }

  hasRoom(id) {
    return this.rooms.some(room => room.id == id)
  }

  getRoomByID(id) {
    return this.rooms.find(room => room.id == id)
  }

  getRoomEnemySocket(room, client) {
    return room.users.find(user => user.socket != client).socket
  }

  makeGuessNumber(roomID, number, socket) {
    const game = this.getRoomByID(roomID).game
    const nextUserID = this.getNextUserID(roomID)

    game.push({
      number,
      user: nextUserID,
      guesses: []
    })

    console.log(this.rooms)
  }

  getNextUserID(roomID) {
    const game = this.getRoomByID(roomID).game
    const users = this.getRoomByID(roomID).users
    
    let nextUserID = undefined

    if (!game.length) {
      nextUserID = users[0].id
    } else {
      nextUserID = game[game.length - 1].user === 1 ? 2 : 1 // пох
    }

    return nextUserID
  }
}


/* const rooms = [
  {
    id: 1,
    min: 0,
    max: 100,
    users: [
      {
        id: 1,
        socket: "here is socket"
      },
      {
        id: 2,
        socket: "here is socket"
      },
    ],
    game: [
      {
        guessedUserID: 1,
        value: 85,
        gueeses: [50, 75, 87, 80, 83, 85]
      },
      {
        guessedUserID: 2,
        value: 42,
        gueeses: [50, 25]
      },
    ]
  }
] */