const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

// Load the same classic script as index.html without WebGL, timers or a DOM.
const source = fs.readFileSync(path.join(__dirname, '..', 'tetris3d.js'), 'utf8');
function gameTypes() {
    const context = vm.createContext({
        self: null,
        Math: Object.assign(Object.create(Math), {random: () => 0})
    });
    return vm.runInContext(source + '\n({STATE, Point, Block, TetrisBoard});', context);
}

function fixture(x = 4, y = 4, z = 8) {
    const types = gameTypes();
    let gameOvers = 0;
    const board = new types.TetrisBoard(x, y, z, current => {
        gameOvers++;
        current.clear();
    });
    return {...types, board, gameOvers: () => gameOvers};
}

function position(block) {
    return [block.loc.x, block.loc.y, block.loc.z];
}

test('placement checks every occupied cube cell', () => {
    const {board, Point, Block, STATE} = fixture();
    const block = new Block(new Point(1, 1, 3), 0);
    assert.equal(board.canPlace(block), true);
    for (const point of block.getPoints()) {
        board.setBlock(point, STATE.FILLED);
        assert.equal(board.canPlace(block), false, `occupied ${point.x},${point.y},${point.z}`);
        board.setBlock(point, STATE.EMPTY);
    }
});

test('placement rejects all six board boundaries before indexing cells', () => {
    const {board, Point, Block} = fixture();
    for (const [x, y, z] of [[-1, 1, 2], [3, 1, 2], [1, -1, 2], [1, 3, 2], [1, 1, -1], [1, 1, 7]]) {
        assert.equal(board.canPlace(new Block(new Point(x, y, z), 0)), false);
    }
    assert.equal(board.canPlace(new Block(new Point(0, 0, 0), 0)), true);
    assert.equal(board.canPlace(new Block(new Point(2, 2, 6), 0)), true);
});

for (const dy of [0, 1]) {
    for (const dz of [0, 1]) {
        test(`lateral movement cannot enter settled cell at face offset ${dy},${dz}`, () => {
            const {board, Point, Block, STATE} = fixture();
            const block = new Block(new Point(0, 1, 3), 0);
            board.addBlock(block);
            const obstacle = new Point(2, 1 + dy, 3 + dz);
            board.setBlock(obstacle, STATE.FILLED);
            board.move(1, 0, 0);
            assert.deepEqual(position(block), [0, 1, 3]);
            assert.equal(board.getBlock(obstacle), STATE.FILLED);
            assert.equal(board.getFilled().length, 1);
        });
    }
}

test('unobstructed lateral moves stay within the board', () => {
    const {board, Point, Block} = fixture();
    const block = new Block(new Point(1, 1, 3), 0);
    board.addBlock(block);
    board.move(1, 0, 0);
    assert.deepEqual(position(block), [2, 1, 3]);
    board.move(1, 0, 0);
    assert.deepEqual(position(block), [2, 1, 3]);
    board.move(0, -1, 0);
    assert.deepEqual(position(block), [2, 0, 3]);
});

for (const dx of [0, 1]) {
    for (const dy of [0, 1]) {
        test(`raised support under cube column ${dx},${dy} freezes the last valid position`, () => {
            const {board, Point, Block, STATE} = fixture();
            const block = new Block(new Point(1, 1, 3), 0);
            const occupied = block.getPoints();
            board.addBlock(block);
            const support = new Point(1 + dx, 1 + dy, 2);
            board.setBlock(support, STATE.FILLED);
            assert.equal(board.advance(), true);
            assert.deepEqual(position(block), [1, 1, 3]);
            for (const point of occupied) assert.equal(board.getBlock(point), STATE.FILLED);
            assert.equal(board.getBlock(support), STATE.FILLED);
            assert.equal(board.getFilled().length, 9);
            assert.equal(board.blocks.includes(block), false);
        });
    }
}

test('free descent advances exactly one z cell without freezing', () => {
    const {board, Point, Block} = fixture();
    const block = new Block(new Point(1, 1, 4), 0);
    board.addBlock(block);
    board.advance();
    assert.deepEqual(position(block), [1, 1, 3]);
    assert.equal(board.blocks[0], block);
    assert.equal(board.getFilled().length, 0);
});

test('a block on the floor freezes without moving below z zero', () => {
    const {board, Point, Block, STATE} = fixture();
    const block = new Block(new Point(1, 1, 0), 0);
    board.addBlock(block);
    assert.equal(board.advance(), true);
    assert.deepEqual(position(block), [1, 1, 0]);
    for (const point of block.getPoints()) assert.equal(board.getBlock(point), STATE.FILLED);
    assert.equal(board.getFilled().length, 8);
});

test('hard drop lands on the floor and leaves the next block active', () => {
    const {board, Point, Block} = fixture();
    const block = new Block(new Point(1, 1, 5), 0);
    board.addBlock(block);
    board.fastMove();
    assert.deepEqual(position(block), [1, 1, 0]);
    assert.equal(board.getFilled().length, 8);
    assert.equal(board.blocks.length, 1);
    assert.notEqual(board.blocks[0], block);
});

test('spawn rejects an occupied cell anywhere in the new cube', () => {
    const {board, Point, Block, STATE} = fixture();
    const spawn = new Block(new Point(1, 1, 6), 0);
    for (const point of spawn.getPoints()) {
        board.setBlock(point, STATE.FILLED);
        assert.equal(board.nextBlock(), false);
        assert.equal(board.blocks.length, 0);
        board.setBlock(point, STATE.EMPTY);
    }
    assert.equal(board.nextBlock(), true);
    assert.deepEqual(position(board.blocks[0]), [1, 1, 6]);
});

test('hard drop stops when blocked spawn triggers game-over reset', () => {
    const {board, Point, STATE, gameOvers} = fixture();
    board.setBlock(new Point(2, 2, 7), STATE.FILLED);
    board.fastMove();
    assert.equal(gameOvers(), 1);
    assert.equal(board.blocks.length, 0);
    assert.equal(board.getFilled().length, 0);
    assert.equal(board.points, 0);
    assert.equal(board.advance(), true);
    assert.equal(board.blocks.length, 1);
    assert.equal(gameOvers(), 1);
});

test('freezing a floor cube still clears both completed layers', () => {
    const {board, Point, Block} = fixture(2, 2, 6);
    const block = new Block(new Point(0, 0, 0), 0);
    board.addBlock(block);
    assert.equal(board.advance(), true);
    assert.equal(board.points, 2);
    assert.equal(board.getFilled().length, 0);
    assert.equal(board.blocks.length, 1);
});
