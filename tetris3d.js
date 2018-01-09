var STATE = Object.freeze({EMPTY: 0, FILLED: 1, BLOCK: 2});

Array.prototype.removeIf = function (callback) {
    let i = this.length;
    while (i--) {
        if (callback(this[i], i)) {
            this.splice(i, 1);
        }
    }
};


class Point {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    plus(other) {
        return new Point(this.x + other.x, this.y + other.y, this.z + other.z)
    }
}

const BLOCKS = [
    [
        new Point(0, 0, 0),
        new Point(0, 0, 1),
        new Point(0, 1, 0),
        new Point(0, 1, 1),
        new Point(1, 0, 0),
        new Point(1, 0, 1),
        new Point(1, 1, 0),
        new Point(1, 1, 1)
    ]
];

class Block {
    constructor(loc, id) {
        this.loc = loc;
        this.id = id;
    }

    getRawPoints() {
        self = this;
        let rawPoints = [];
        BLOCKS[this.id].forEach(function (point) {
            rawPoints.push(self.loc.plus(point))
        });
        return rawPoints
    }


}

class TetrisBoard {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.buildBoard(x, y, z);
        this.blocks = []
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
                        coords.push(new Point(i, j, k))
                    }
                }
            }
        }
        return coords
    }

    getRawBlocks() {
        let ret = [];
        this.blocks.forEach(function (block) {
            ret.push(block.getRawPoints());
        });
        return ret
    }

    getLowestBlock(blockDef) {
        let lowest = new Point(Infinity, Infinity, Infinity);
        blockDef.forEach(function (block) {
            if (block.z < lowest.z) {
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
        this.board[loc.x][loc.y][loc.z] = state;
    }

    getBlock(loc) {
        return this.board[loc.x][loc.y][loc.z];
    }

    addBlock(loc, blockId) {
        this.blocks.push(new Block(loc, blockId))
    }

    shouldFreeze(blockDef) {
        const lowestBlock = this.getLowestBlock(blockDef);
        return lowestBlock.z === 0 || this.getBlock(lowestBlock.plus(new Point(0, 0, -1))) === STATE.FILLED;
    }

    freeze() {
        let self = this;
        this.blocks.removeIf(function (block) {
            if (self.shouldFreeze(block.getRawPoints())) {
                block.getRawPoints().forEach(function (block) {
                    self.setBlock(block, STATE.FILLED)
                });
                return true;
            }
        });
    }

//TODO: make sure block freeze is done after
    advance() {
        this.blocks.forEach(function (block) {
            block.loc = block.loc.plus(new Point(0, 0, -1));
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

