class Cards {
  constructor(cartAttribute) {
    this.cartAttribute = cartAttribute
    this.cards = document.querySelectorAll(`[${this.cartAttribute}]`)

    this.hideAll()
    this.showCard("select-type")
  }

  hide(card) {
    card.style.display = 'none'
  }

  show(card) {
    card.style.display = ''
  }

  hideAll() {
    this.cards.forEach(card => this.hide(card))
  }

  showCard(name) {
    this.hideAll()
    this.cards.forEach(card => {
      if (this.getNameOfCard(card) === name) {
        this.show(card)
      }
    })
  }

  getNameOfCard(card) {
    return card.getAttribute(this.cartAttribute)
  }
}

const cards = new Cards("data-card")

class Game {
  constructor(data) {
    this.init(data)
  }

  init(data) {
    this.cards = data.cards
    this.socket = io.connect("http://localhost:8080")
    this.stats = document.getElementById("stats-list")
    this.initEvents()
  }
  
  initEvents() {
    this.btnAttr = "data-onclick"
    this.buttons = document.querySelectorAll(`[${this.btnAttr}]`)
    this.buttons.forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault()
        this.onButtonClick(event.target)
      })
    })

    this.socket.on("created", data => this.onCreated(data))
    this.socket.on("connected", data => this.onConnected(data))
    this.socket.on("connection-error", () => this.onConnectionError())
    this.socket.on("enemy-is-connected", data => this.onEnemyIsConnected(data))
  }

  onCreated(data) {
    this.setTextToHTMLBlock("waiting-for-id", data.room)
    this.cards.showCard("waiting-for")
  }

  onConnected(data) {
    this.data = data
    this.cards.showCard("enemy-is-guessing")
  }

  onEnemyGuessed(data) {
    const field = document.getElementById("player-is-guessing-number")
    const count = document.getElementById("player-is-guessing-count")
    field.min = data.min
    field.max = data.max
    count.innerText = 0

    this.cards.showCard("player-is-guessing")
  }

  onConnectionError() {
    const msg = document.getElementById("connect-wrong-id-msg")
    msg.style.display = "block"
    setTimeout(() => {
      msg.style.display = "none"
    }, 2000);
  }

  onEnemyIsConnected(data) {
    this.data = data
    const field = document.getElementById("guess-for-enemy-number")
    field.min = data.min
    field.max = data.max

    this.cards.showCard("guess-for-enemy")
  }

  setTextToHTMLBlock(id, value) {
    document.getElementById(id).innerText = value
  }

  onButtonClick(button) {
    const action = button.getAttribute(this.btnAttr)
    switch (action) {
      case "to-select-type-card": {
        this.cards.showCard("select-type")
        break;
      }

      case "to-create-card": {
        this.cards.showCard("create")
        break;
      }

      case "to-connect-card": {
        this.cards.showCard("connect")
        break;
      }

      case "create": {
        const min = +document.querySelector("#create-min").value
        const max = +document.querySelector("#create-max").value
        
        this.socket.emit("create", {
          min: Math.min(min, max),
          max: Math.max(min, max)
        })
        
        break;
      }    

      case "connect": {
        const room = +document.querySelector("#roomID").value
        if (room) {
          this.socket.emit("connect", { room })
        }

        break;
      }    

      case "guess-for-enemy": {
        const field = document.querySelector("#guess-for-enemy-number")
        const number = +field.value
        const min = +field.min
        const max = +field.max

        if (number && number > min && number < max) {
          this.socket.emit("guess-for-enemy", { number, room: this.data.roomID })
        }

        break;
      }    
    }
  }
}

const game = new Game({ cards })

document.addEventListener("change", e => {
  const element = e.target
  if (element.nodeName == "INPUT" && element.type == "number") {
    if (element.min && +element.min > +element.value) {
      element.value = element.min
    } else if (element.max && +element.max < +element.value) {
      element.value = element.max
    }
  }
})