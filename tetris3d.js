var STATE = Object.freeze({EMPTY: 0, FILLED: 1, BLOCK: 2});


const BLOCKS = [
    [
        [0, 0, 0],
        [0, 0, 1],
        [0, 1, 0],
        [0, 1, 1],
        [1, 0, 0],
        [1, 0, 1],
        [1, 1, 0],
        [1, 1, 1]
    ]
];

function sumPos(loc1, loc2) {
    return [loc1[0] + loc2[0], loc1[1] + loc2[1], loc1[2] + loc2[2]]
}

class TetrisBoard {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.buildBoard(x, y, z);
    }

    buildBoard(x, y, z) {
        this.board = new Array(x);
        for (let i = 0; i < x; i++) {
            this.board[i] = new Array(y);
            for (let j = 0; j < y; j++) {
                this.board[i][j] = new Array(z);
                for (let k = 0; k < z; k++) {
                    this.board[i][j][k] = STATE.EMPTY;
                }
            }
        }
    }

    isBottomFilled() {
        for (let i = 0; i < this.x; i++) {
            for (let j = 0; j < this.y; j++) {
                if (this.board[i][j][0] === STATE.EMPTY) {
                    return false;
                }
            }
        }
        return true;
    }

    getWithState(state) {
        let coords = [];
        for (let i = 0; i < this.x; i++) {
            for (let j = 0; j < this.y; j++) {
                for (let k = 0; k < this.z; k++) {
                    if (this.board[i][j][k] === state) {
                        coords.push([i, j, k])
                    }
                }
            }
        }
        return coords
    }

    getBlocks() {
        return this.getWithState(STATE.BLOCK);
    }

    getLowestBlock() {
        let lowest = [Infinity, Infinity, Infinity];
        this.getBlocks().forEach(function (block) {
            if (block[2] < lowest[2]) {
                lowest = block;
            }
        });
        return lowest
    }

    getFilled() {
        return this.getWithState(STATE.FILLED);
    }

    setBlock(loc, state) {
        //TODO: add validation and loggin
        this.board[loc[0]][loc[1]][loc[2]] = state;
    }

    getBlock(loc) {
        return this.board[loc[0]][loc[1]][loc[2]];
    }


    addBlock(loc, blockId) {
        self = this;
        BLOCKS[blockId].forEach(function (point) {
            self.setBlock(sumPos(loc, point), STATE.BLOCK);
        });
    }

    shouldFreeze() {
        const lowestBlock = this.getLowestBlock();
        return lowestBlock[2] === 0 || this.getBlock(sumPos(lowestBlock, [0, 0, -1])) === STATE.FILLED;
    }

    freeze() {
        const blocks = this.getBlocks();
        if (this.shouldFreeze(blocks)) {
            blocks.forEach(function (block) {
                this.setBlock(block, STATE.FILLED)
            })
        }
    }

//TODO: make sure block freeze is done after
    advance() {
        self = this;
        this.getBlocks().map(function (currentBlock) {
            self.setBlock(currentBlock, STATE.EMPTY);
            return sumPos(currentBlock, [0, 0, -1])
        }).forEach(function (currentBlock) {
            self.setBlock(currentBlock, STATE.BLOCK)
        });
        this.freeze();
    }

}

//TODO: use this
// function createArray(length) {
//     var arr = new Array(length || 0),
//         i = length;
//
//     if (arguments.length > 1) {
//         var args = Array.prototype.slice.call(arguments, 1);
//         while(i--) arr[length-1 - i] = createArray.apply(this, args);
//     }
//
//     return arr;
// }


//TODO: make checking for more lines
//TODO: make sure that at this stage all blocks are frozen

