const STATE = Object.freeze({EMPTY: 0, FILLED: 1});

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

    getPoints() {
        self = this;
        let rawPoints = [];
        BLOCKS[this.id].forEach(function (point) {
            rawPoints.push(self.loc.plus(point))
        });
        return rawPoints
    }

    getSize() {
        return this.getBoundsInternal(BLOCKS[this.id]).high
    }

    getMoved(loc) {
        return new Block(this.loc.plus(loc), this.id);
    }

    move(loc) {
        this.loc = this.loc.plus(loc);
    }


    getBounds() {
        return this.getBoundsInternal(this.getPoints());
    }

    getBoundsInternal(points) {
        let lowest = new Point(Infinity, Infinity, Infinity);
        let highest = new Point(-Infinity, -Infinity, -Infinity);
        points.forEach(function (block) {
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
}

class TetrisBoard {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.buildBoard(x, y, z);
        this.blocks = [];
        this.points = 0
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

    fastMove() {
        while (!this.advance()) ;
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
        let bounds = block.getBounds();
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
            ret.push(block.getPoints());
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
        this.board[loc.x][loc.y][loc.z] = state;
    }

    getBlock(loc) {
        return this.board[loc.x][loc.y][loc.z];
    }

    addBlock(block) {
        this.blocks.push(block)
    }

    shouldFreeze(blockDef) {
        const lowestBlock = this.getLowestBlock(blockDef);
        return lowestBlock.z === 0 || this.getBlock(lowestBlock.plus(new Point(0, 0, -1))) === STATE.FILLED;
    }

    freeze() {
        let self = this;
        this.blocks.removeIf(function (block) {
            if (self.shouldFreeze(block.getPoints())) {
                block.getPoints().forEach(function (block) {
                    self.setBlock(block, STATE.FILLED)
                });
                return true;
            }
        });
    }

    advance() {
        this.blocks.forEach(function (block) {
            block.loc = block.loc.plus(new Point(0, 0, -1));
        });
        this.freeze();
        while (this.isBottomFilled()) {
            this.clearBottom()
        }
        if (this.blocks.length === 0) {
            this.nextBlock();
            return true;
        }
    }

    nextBlock() {
        let block = new Block(new Point(rand(this.x / 2 - this.x / 4, this.x / 2 + this.x / 4),
            rand(this.y / 2 - this.y / 4, this.y / 2 + this.y / 4), this.z - 1),
            rand(0, BLOCKS.length));
        let blockSize = block.getSize();
        block.move(new Point(0, 0, -blockSize.z));
        if (this.isInBounds(block)) {
            this.addBlock(block)
        }
    }

    clearBottom() {
        for (let z = 0; z < this.z - 1; z++) {
            for (let x = 0; x < this.x; x++)
                for (let y = 0; y < this.y; y++) {
                    this.board[x][y][z] = this.board[x][y][z + 1];
                }
        }
        for (let x = 0; x < this.x; x++) {
            for (let y = 0; y < this.y; y++) {
                this.board[x][y][this.z - 1] = STATE.EMPTY;
            }
        }
        this.points += 1;
        console.log(this.points)
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


