const STATE = Object.freeze({EMPTY: 0, FILLED: 1});

//TODO: cast shadow of block on board
//TODO: fix block falling of the edge
//TODO: make indicators which direction is key bound

Array.prototype.removeIf = function (callback) {
    let i = this.length;
    while (i--) {
        if (callback(this[i], i)) {
            this.splice(i, 1);
        }
    }
};


function rand(x, y) {
    return Math.floor((Math.random() * (y - x)) + x);
}

class Point {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    plus(other) {
        return new Point(this.x + other.x, this.y + other.y, this.z + other.z)
    }

    isAnyLower(point) {
        return this.x < point.x || this.y < point.y || this.z < point.z;
    }

    isAnyHigher(point) {
        return this.x >= point.x || this.y >= point.y || this.z >= point.z;
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

    getMoved(loc) {
        return new Block(this.loc.plus(loc), this.id);
    }

    move(loc) {
        this.loc = this.loc.plus(loc);
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

    move(x, y, z) {
        self = this;
        let moveDir = new Point(x, y, z);
        //TODO: move only lowest block
        this.blocks.forEach(function (block) {
            if (self.isInBounds(block.getMoved(moveDir))) {
                block.move(moveDir);
            }
        })
    }

    isInBounds(block) {
        let bounds = this.getBounds(block);
        let anyLower = bounds.low.isAnyLower(new Point(0, 0, 0));
        let anyHigher = bounds.high.isAnyHigher(this.getSize());
        return !anyLower && !anyHigher;
    }

    getSize() {
        return new Point(this.x, this.y, this.z);
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

    getBounds(block) {
        let lowest = new Point(Infinity, Infinity, Infinity);
        let highest = new Point(-Infinity, -Infinity, -Infinity);
        block.getRawPoints().forEach(function (block) {
            if (block.x < lowest.x) {
                lowest = block;
            }
            if (block.y < lowest.y) {
                lowest = block;
            }
            if (block.z < lowest.z) {
                lowest = block;
            }
            if (block.x > highest.x) {
                highest = block;
            }
            if (block.y > highest.y) {
                highest = block;
            }
            if (block.z > highest.z) {
                highest = block;
            }
        });
        return {
            low: lowest, high: highest
        }
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
        if (this.blocks.length === 0) {
            this.nextBlock()
        }
    }

    nextBlock() {
        this.addBlock(new Point(rand(this.x / 2 - this.x / 4, this.x / 2 + this.x / 4), rand(this.y / 2 - this.y / 4, this.y / 2 + this.y / 4), this.z), rand(0, BLOCKS.length))
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

