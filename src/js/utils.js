class DungeonSolitaire {
    constructor() {
        this.currentGame = null
        this.wireUpButtons()
    }

    // convenience function to save some typing
    getById(_id) {
        return document.getElementById(_id)
    }

    // convenience function for showing action buttons
    showActionButton(_id) {
        this.getById(_id).classList.add('visible')	
    }

    showNavigationButtons() {
        if (this.currentGame.goingDown)
            this.showActionButton('goDownALevel')
        this.showActionButton('goUpALevel')
    }

    clearButtonClasses() {
        var buttons = document.querySelectorAll('#currentActions button')
        for (var i = buttons.length - 1; i > -1; i--) {
            buttons[i].classList.remove('visible')
        }
    }

    // convenience function for updating the encounter text
    updateEncounterText(text, erase = false) {
        if (erase)
            this.getById('currentEncounter').innerText = ''
        
        this.getById('currentEncounter').innerText += text + "\n"
    }

    // function to initialize all of the buttons to listen for their click event
    wireUpButtons() {
        // wire up the 'draw a card' button
        this.getById('drawACard').addEventListener('click', () => {
            this.clearButtonClasses()
            this.currentGame.currentLevel.drawCard()
        })

        // Initialize the 'New Game' buttons
        this.getById('newGameButton').addEventListener('click', function startNewGame() {
            window.location.hash = "game"
            this.currentGame = new Game()
        })
        this.getById('newGame').addEventListener('click', function startNewGame() {
            this.currentGame = new Game()
        })
    }
}
