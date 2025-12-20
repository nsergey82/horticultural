// Game constants
const FARM_WIDTH = 8;
const FARM_HEIGHT = 6;
const TILE_T = "tile";

// base and overlays
const DIRT_C = " ";
const PLOUGHED_C = "p";
const PLANTED_C = "s";
const WATERED_C = "w";
const RIPE_C = "r";

const TOOL_PLOUGH = "plough";
const TOOL_PLANT = "plant seeds";
const TOOL_WATER = "water crops";
const TOOL_REAP = "reap crops";
const TOOLS = [TOOL_PLOUGH, TOOL_PLANT, TOOL_WATER, TOOL_REAP];

// a tile will have a "terrain" type
// and an ordered list of overlays
// they can define e.g., a planted tree 3 days old
// and the fact that it is watered today
class Overlay {
    constructor(kind = "plant") {
        this.kind = kind;
        this.age = 0;
    }
}

class TileState {
    constructor(base = DIRT_C) {
        this.baseTile = base;
        this.overlays = [];
    }

    push(ov) { this.overlays.push(ov); }
    has(kind) {
        return this.overlays.some(x => x.kind === kind);
    }

    get(kind) {
        return this.overlays.find(x => x.kind === kind);
    }

    rm(kind) {
        this.overlays = this.overlays.filter(v => v.kind !== kind)
    }

    apply(tool) {
        if (tool === TOOL_PLOUGH) {
            this.plough();
        }
        else if (tool === TOOL_PLANT) {
            this.plant(PLANTED_C);
        }
        else if (tool === TOOL_WATER) {
            this.water();
        }
        else if (tool === TOOL_REAP) {
            this.reap();
        }
    }

    isplant() {
        return this.has(PLANTED_C) || this.has(RIPE_C);
    }

    plough() {
        if (this.baseTile === DIRT_C && !this.isplant()) {
            this.overlays.push(new Overlay(PLOUGHED_C));
        }
    }

    plant(seed) {
        if (this.has(PLOUGHED_C)) {
            this.push(new Overlay(seed));
        }
    }

    water() {
        let x = this.get(WATERED_C);
        if (x !== undefined) {
            x.age += 1
            if (x.age >= 2) {
                this.overlays.push(new Overlay(RIPE_C));
                this.rm(PLANTED_C);
                this.rm(WATERED_C);
            }
        }
        else if (this.has(PLANTED_C)) {
            this.overlays.push(new Overlay(WATERED_C));
        }
    }

    reap() {
        if (this.has(RIPE_C)) {
            this.overlays = [];
        }
    }
}

class GameState {
    constructor(w = FARM_WIDTH, h = FARM_HEIGHT) {
        this.field = Array.from({ length: h }, () => []);
        this.field.forEach(row => {
            for (let i = 0; i < w; ++i) {
                row.push(new TileState());
            }
        });

        this.activeToolIndex = 0;
        this.collected = 0;
    }

    toArrayOfStrings() {
        return this.field.map((row) => row.map((t) => t.baseTile).join(""));
    }

    toJson() {
        return JSON.stringify(this.field);
    }

    nextTool() {
        this.activeToolIndex = (1 + this.activeToolIndex) % TOOLS.length;
        return TOOLS[this.activeToolIndex];
    }

    // apply tool if possible, return tile (maybe modified)
    applyTool(r, c) {
        let tile = this.field[r][c];
        const before = tile.has(RIPE_C);
        tile.apply(TOOLS[this.activeToolIndex])
        const after = !tile.has(RIPE_C);
        if (before && after) {
            this.collected += 1;
        }
        return tile;
    }
}
