/*
 * Class representing a Level in the Dungeon
 */

class Level {
  constructor(game, level_number) {
    this.complete = false
    this.success = false
    this.encounterCard = null
    this.cache = []
    this.game = game
    this.level_number = level_number || 1

    // Initialize and reset the display
    document.querySelector('ol.levelIndicator-levels').appendChild(this.listItem())
    this.resetDisplayedCache()
    this.drawCard()
  }

  listItem() {
    var el = document.createElement('li')
    el.innerText = this.level_number
    return el
  }

  drawCard() {
    // get a card from the game's deck, if available
    var card = this.game.drawCard()

    if (card) {
      // add card to the level's cache
      this.addToCache(card)

      // display the card to the user
      this.displayCard(card)

      // determine what the card means and what to do about it
      if (card.value >= 11) // Jack or Higher
        this.resolveSpecialCard(card)
      else
        this.resolveEncounter(card)
    } else {
      this.game.gameFailedBy('getting lost before you could get out.')
    }
  }

  addToCache(card) {
    // add to the cache
    this.cache.push(card)

    // add to the displayed list of cards
    var cardList = getById('level-cards')
    cardList.appendChild(card.listItem())
  }

  displayCard(card) {
    // TODO add displaying a card's graphic too

    // Show the card's name
    getById('currentCard-name').innerText = card.name
  }

  resetDisplayedCache() {
    getById('level-cards').innerHTML = ''
  }
  
  resolveSpecialCard(card) {
    // determines handling of special cards
    switch (card.rank) {
      // Jacks are used as spells with different abilities based on the suit
      // The joker is considered a 'Spell of Light' which takes the last Ace and puts it on the bottom of the stack
      case "Jack":
      case "Spell":
        this.game.spellbook.addSpell(card.name)

        if (this.encounterCard && card.suit === this.encounterCard.suit)
          showActionButton('useASpell')
        break

      // Kings represent the finding of a king's tomb. They count as treasure worth 10 points.
      case "King":
        this.cache.push(card)
        break

      // Aces represent your torchs. You start the game with four torches, each Ace blows one out.
      case "Ace":
        this.game.blowOutATorch(card)
        break
    }

    this.resolveEncounter(card)
  }

  displayEncounterText(suit) {
    var encounterTypes = {
      "Clubs": "sealed door",
      "Diamonds": "trap",
      "Spades": "monster"
    }

    getById('currentEncounter').innerText = `It's a ${encounterTypes[suit]}!`
  }
  
  resolveEncounter(card) {
    // determine if there is a new encounter card or the new card is a queen
    if (!this.encounterCard && card.value < 11) {
      this.encounterCard = card
      this.displayEncounterText(card.suit)
    } else if (card.rank === "Queen") {
      // Queens represent the favor of the Goddesses and allow you to automatically win the level
      this.success = true
      this.complete = true
      getById('currentEncounter').innerText += "\nA goddess smiles down on you, you will surely beat this level."
    } else if (this.encounterCard && card.value < 11) {
      // there's already an encounter card defined, and the new card is not a face card
      if (this.encounterCard.value <= card.value) {
        // new card beats the current encounter, resolve the level
        this.success = true
        this.complete = true
      } else {
        // new card does not beat the current encounter, check for resolution
        this.complete = this.encounterFail(card)
      }
    }

    if (this.success && this.complete) {
      this.encounterCompleteAndSuccessful()
    } else if (!this.success && this.complete && this.game.health > 0) {
      this.encounterCompleteButUnsuccessful()
    } else if (!this.success && !this.complete) {
      this.encounterIncompleteAndUnsuccessful()
    }
  }

  encounterCompleteAndSuccessful() {
    /* 
     * If level is now successful and complete, add appropriate cards to score/kings.
     * One of the critical points here is to ensure that at least one card stays behind,
     * as this is how the physical game keeps track of what levels have been finished.
     * Occasionally, this may mean no/fewer points are added to the score, as the only
     * card in the cache that can stay behind is a treasure card.
     */
    console.log("Succeeded and Complete")

    var points = this.cache.reduce(function(pts, card) {
      if (card.rank == 'King')
        return pts + 10
      else if (card.suit == 'Diamonds' && card.value <= 10)
        return pts + card.value
      else
        return pts
    }, 0)
    this.game.increaseScore(points)

    getById('currentEncounter').innerText = "You've beaten this level!"
    this.game.showNavigationButtons()
  }

  encounterCompleteButUnsuccessful() {
    // if level is now complete but unsuccessful and player is still alive,
    // ask for which direction to go next (up or down)
    console.log("Complete but no success")

    this.game.showNavigationButtons()
  }

  encounterIncompleteAndUnsuccessful() {
    // if level is incomplete, prompt user to choose an action
    console.log("Incomplete and no success")

    if (this.encounterCard
      && this.game.spellbook['has Jack of ' + this.encounterCard.suit])
      showActionButton('useASpell')

    if (this.game.treasures.length > 0)
      showActionButton("dropATreasure")

    showActionButton("drawACard")
  }

  /*
   * encounterFail takes the current card and compares it with the encounter card
   * in order to determine what damage, if any, is taken.
   * encounterFail returns a boolean for 'Level.complete'
   */
  encounterFail(card) {
    var suit = this.encounterCard.suit
    var stillAlive = true

    if (suit === "Spades") {
      // facing a monster, you take damage if you don't kill it right out,
      // and then you have to keep facing it until one of you dies
      var damage = this.encounterCard.value - card.value
      stillAlive = this.game.takeDamage(damage)

      if (!stillAlive)
        this.game.gameFailedBy("being eaten by a grue")
      else
        return false // return false because you have to keep facing the monster until it's dead
    }

    if (suit === "Diamonds") {
      // facing a trap, you take damage once, lose the level, and then
      // you either move on to the next level, or you're dead
      var damage = this.encounterCard.value - card.value
      stillAlive = this.game.takeDamage(damage)

      if (!stillAlive)
        this.game.gameFailedBy("taking an arrow to the knee")
    }

    return true
  }
}