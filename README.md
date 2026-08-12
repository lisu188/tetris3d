# Tetris3D

A small browser-based **3D falling-block prototype** built with JavaScript, WebGL and Three.js.

The project focuses on the game-state mechanics behind a three-dimensional board: block placement, collision/bounds checks, gravity, fast drop and clearing completed state, with a minimal wireframe renderer on top.

## Run

No build step is required. Open `index.html` in a browser.

## Controls

- `W` — move forward
- `S` — move backward
- `A` — move left
- `D` — move right
- `Space` — drop the active block

## Structure

- `tetris3d.js` — board state and game mechanics
- `index.html` — WebGL scene, input and rendering loop
- `three.min.js` — vendored Three.js runtime; the file retains the upstream license reference

## Status

**Legacy prototype.** This is intentionally a compact experiment rather than a polished game or modern frontend application. It is kept public as an example of early browser/WebGL and 3D game-logic work.
