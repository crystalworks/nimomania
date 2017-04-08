import AI from './nim-ai';

export default class Nim extends Phaser.State {
    create() {
        this.row_count = 3;
        this.max_coins_in_row_count = 5;
        this.hand_x = 400;
        this.hand_y = 250;
        this.coin_x = 100;
        this.coin_y = 100;
        this.coin_offset = 50;
        this.coins = [];
        this.digitCoins = [];
        this.currentLine = 0;
        this.counter = 0;
        this.hand = this.add.sprite(this.hand_x, this.hand_y, 'hand');
        this.hand.inputEnabled = true;
        this.hand.events.onInputDown.add(this.handListener, this);
        for (let i = this.row_count - 1; i > -1; i -= 1) {
            this.coins[i] = [];
            this.digitCoins[i] = [];
            for (let j = 0; j < this.max_coins_in_row_count - i; j += 1) {
                this.digitCoins[i][j] = 1;
                this.coins[i][j] = this.add.sprite(
                    this.coin_x + (this.coin_offset * j),
                    this.coin_y + (this.coin_offset * (this.row_count - i)),
                    'coin');
                this.coins[i][j].inputEnabled = true;
                this.coins[i][j].events.onInputDown.add(this.coinsListener, this);
            }
        }
    }

    coinsListener(...args) {
        if (this.currentLine === 0 || this.currentLine === args[0].position.y) {
            this.currentLine = args[0].position.y;
            this.hand.loadTexture('hand-active', 0);
            if (args[0].key === 'coin') {
                args[0].loadTexture('coin-selected', 0);
                this.counter += 1;
            } else {
                args[0].loadTexture('coin', 0);
                this.counter -= 1;
            }
            if (this.counter === 0) {
                this.currentLine = 0;
                this.hand.loadTexture('hand', 0);
            }
        }
    }

    handListener() {
        if (this.hand.key === 'hand-active') {
            const line = this.row_count - ((this.currentLine - this.coin_y) / this.coin_offset);
            this.coins[line].forEach((x, index) => {
                if (x.key === 'coin-selected') {
                    x.loadTexture('coin', 0);
                    x.visible = false;
                    this.digitCoins[line][index] = 0;
                }
            });
            this.counter = 0;
            this.currentLine = 0;
            this.hand.loadTexture('hand', 0);
            if (this.checkEndOfGame()) {
                this.newgame();
            }
        }
    }

    newgame() {
        for (let i = this.row_count - 1; i > -1; i -= 1) {
            for (let j = 0; j < this.max_coins_in_row_count - i; j += 1) {
                this.digitCoins[i][j] = 1;
                this.coins[i][j].visible = true;
            }
        }
    }

    checkEndOfGame() {
        
        let countCoinsInRow = this.getCountCoinsInRow();
        
        switch (this.getCountLeftCoins(countCoinsInRow)) {
        case 0:
            alert('You win!');
            return true;
        case 1:
            alert('You lose');
            return true;
        default:
            this.stepAI(countCoinsInRow);
        }
        return false;
    }

    getCountCoinsInRow() {
        const countCoinsInRow = [];
        this.digitCoins.forEach((x, index) => {
            let count = 0;
            x.forEach((y) => {
                if (y === 1) {
                    count += 1;
                }
            });
            countCoinsInRow[index] = count;
        });
        return countCoinsInRow;
    }

    stepAI(countCoinsInRow){
        const step = AI(countCoinsInRow);
        let count = step.count;
        this.digitCoins[step.row] = this.digitCoins[step.row].map((x, index) => {
            if ((count > 0) && (x !== 0)) {
                this.coins[step.row][index].visible = false;
                count -= 1;
                return 0;
            }
            return x;
        });
    }

    getCountLeftCoins(countCoinsInRow){
        let count = 0;
        const countEmptyRows = countCoinsInRow.reduce((acc, x) => {
            if (x === 0){
                acc += 1;
            }
            count += x;
            return acc
        }, 0);
        if (this.row_count - countEmptyRows === 1){
            count = 1;
        }
        return count;
    }
}
