/*
 * The main Game object for the card game
 */
class Game {
  constructor() {
    // Generic card-game properties
    this.deck = []
    this.ranks = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Jack', 'Queen', 'King']
    this.suits = ['Clubs', 'Diamonds', 'Hearts', 'Spades']
    
    // Initialize and shuffle the deck so it's in a ready state
    this.createDeck()
    
    // Dungeon Solitaire-specific properties
    this.health = 9
    this.torches = 4
    this.score = 0
    this.treasures = []
    this.kings = 0
    this.spellbook = {
      "has Spell of Light": false,
      "has Jack of Clubs": false,
      "has Jack of Diamonds": false,
      "has Jack of Hearts": false,
      "has Jack of Spades": false,
      
      addSpell(spell) {
        this['has ' + spell] = true
      }
    }

    this.levels = []
    this.currentLevel = new Level(this)
    this.levels.push(this.currentLevel)
    
    this.goingDown = true

    DungeonSolitaire.wireUpButtons()
  }

  createDeck() {
    var game = this
    game.suits.forEach(function(suit) {
      game.ranks.forEach(function(rank, value) {
        // Don't add the 2-10 of hearts as those are used for keeping track of health
        if (suit !== 'Hearts' || (suit === 'Hearts' && value !== 0 && value > 10))
          game.deck.push(new Card({rank, value: value + 1, suit}))
      })
    })
    game.deck.push(new Card({rank: 'Spell', value: 99, suit: 'Light'}))
    game.shuffleDeck(7) // Shuffle the deck seven times; casino standard
  }

  shuffleDeck(times) {
    var cards = this.deck
    var cardsLength = cards.length
    for (var i = 0; i < times; i++) {
      cards.forEach(function(card, currentPosition) {
        var newPosition = Math.floor(Math.random() * cardsLength)
        cards[currentPosition] = cards[newPosition]
        cards[newPosition] = card
      })
    }
  }

  drawCard() {
    if (this.deck.length > 0)
      return this.deck.shift()
    else
      return null
  }

  increaseScore(amount) {
    this.score += amount
    util.getById('totalScore').innerText = this.score
  }

  takeDamage(damage) {
    this.health -= damage
    util.getById('game-healthPoints').innerText = this.health
    return (this.health <= 0) // determines 'still alive' status
  }

  blowOutATorch(card) {
    this.torches--
    util.getById('game-torches').innerText = this.torches

    if (this.torches === 0 && !this.spellbook["has Spell of Light"]) {
      this.gameFailedBy('getting lost in the dark with no torches to see by.')
    } else if (this.torches === 0 && this.spellbook["has Spell of Light"]) {
      util.updateEncounterText('Using your Spell of Light to re-light one torch.')
      this.torches = 1
      this.deck.push(card)
    }
  }

  gameFailedBy(cause) {
    var retVal = "You were defeated by " + cause + "\n"
    retVal += "Your final score would have been " + this.score + " had you survived."
    util.updateEncounterText(retVal)
    this.gameOver()
  }

  gameSuccess() {
    var retVal = "Congratulations! You have successfully made it out of the dungeon!\n"
    retVal += "Your final score is " + this.score + ", including " + this.kings + " king"
    if (this.kings !== 1)
      retVal += "s"
    retVal += " and "
    if (this.spellbook.hasSpellOfLight) {
      retVal += "an"
    } else {
      retVal += "no"
    }
    retVal += " unused Spell of Light."
    util.updateEncounterText(retVal)
    this.gameOver()
  }

  gameOver() {
    util.showActionButton('newGame')
  }
}
