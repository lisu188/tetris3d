var STATE = Object.freeze({EMPTY: 0, FILLED: 1, BLOCK: 2})

//TODO: wrap along with board
var xSize = 12;
var ySize = 12;
var zSize = 12;

var BLOCKS = [
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

function buildBoard(x, y, z) {
    var array = new Array(x);
    for (var i = 0; i < x; i++) {
        array[i] = new Array(y);
        for (var j = 0; j < y; j++) {
            array[i][j] = new Array(z);
            for (var k = 0; k < z; k++) {
                array[i][j][k] = STATE.EMPTY;
            }
        }
    }
    return array
}

//TODO: make checking for more lines
//TODO: make sure that at this stage all blocks are frozen
function isBottomFilled(tetrisBoard) {
    for (var i = 0; i < xSize; i++) {
        for (var j = 0; j < ySize; j++) {
            if (tetrisBoard[i][j][0] === STATE.EMPTY) {
                return false;
            }
        }
    }
    return true;
}

function getWithState(tetrisBoard, state) {
    var coords = [];
    for (var i = 0; i < xSize; i++) {
        for (var j = 0; j < ySize; j++) {
            for (var k = 0; k < zSize; k++) {
                if (tetrisBoard[i][j][k] === state) {
                    coords.push([i, j, k])
                }
            }
        }
    }
    return coords
}

function getBlocks(tetrisBoard) {
    return getWithState(tetrisBoard, STATE.BLOCK);
}

function getFilled(tetrisBoard) {
    return getWithState(tetrisBoard, STATE.FILLED);
}

function setBlock(tetrisBoard, loc, state) {
    //TODO: add validation and loggin
    tetrisBoard[loc[0]][loc[1]][loc[2]] = state;
}

function getBlock(tetrisBoard, loc) {
    return tetrisBoard[loc[0]][loc[1]][loc[2]];
}

function sumPos(loc1, loc2) {
    return [loc1[0] + loc2[0], loc1[1] + loc2[1], loc1[2] + loc2[2]]
}

function addBlock(tetrisBoard, loc, blockId) {
    BLOCKS[blockId].forEach(function (point) {
        setBlock(tetrisBoard, sumPos(loc, point), STATE.BLOCK);
    });
}

function shouldFreeze(tetrisBoard, blocks) {
    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i]
        //TODO: make block class
        //TODO: make method to check if block iss floor
        if (block[2] === 0 || getBlock(tetrisBoard, sumPos(block, [0, 0, -1])) === STATE.FILLED) {
            return true;
        }
    }
    return false;
}

function freeze(tetrisBoard) {
    var blocks = getBlocks(tetrisBoard)
    if (shouldFreeze(tetrisBoard,blocks)) {
        blocks.forEach(function (block) {
            setBlock(tetrisBoard, block, STATE.FILLED)
        })
    }
}

//TODO: make sure block freeze is done after
function advance(tetrisBoard) {
    getBlocks(tetrisBoard).map(function (currentBlock) {
        setBlock(tetrisBoard, currentBlock, STATE.EMPTY)
        return sumPos(currentBlock, [0, 0, -1])
    }).forEach(function (currentBlock) {
        setBlock(tetrisBoard, currentBlock, STATE.BLOCK)
    });
    freeze(tetrisBoard);
}

function testMove(tetrisBoard) {
    advance(tetrisBoard);
    console.log(isBottomFilled(tetrisBoard), getBlocks(tetrisBoard), getFilled(tetrisBoard));
}

var tetrisBoard = buildBoard(xSize, ySize, zSize);
addBlock(tetrisBoard, [5, 5, 10], 0);
console.log(getBlocks(tetrisBoard));
testMove(tetrisBoard)
testMove(tetrisBoard)
testMove(tetrisBoard)
testMove(tetrisBoard)
testMove(tetrisBoard)
testMove(tetrisBoard)
testMove(tetrisBoard)
testMove(tetrisBoard)
testMove(tetrisBoard)
testMove(tetrisBoard)
testMove(tetrisBoard)
testMove(tetrisBoard)
testMove(tetrisBoard)
testMove(tetrisBoard)
testMove(tetrisBoard)
testMove(tetrisBoard)
testMove(tetrisBoard)
testMove(tetrisBoard)
testMove(tetrisBoard)