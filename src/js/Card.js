/*
 * @param rank [String] String representation of the card's rank
 * @param value [Integer] Integer representation of the card's rank
 * @param suit [String] What suit does the card belong to?
 * @function name [String] "Full name" of the card, e.g. "Ace of Hearts"
 */
class Card {
  constructor(data) {
    this.rank = data.rank
    this.value = data.value
    this.suit = data.suit
    this.name = this.rank + " of " + this.suit
    this.graphic = '' // TODO
  }

  listItem() {
  	var el = document.createElement('li')
  	el.innerText = this.name
  	return el
  }
}
