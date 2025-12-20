function tileToRender(k, tile, rtile) {
    rtile.children = [];
    if (tile.overlays.length === 0) {
        return;
    }
    if (tile.has(PLOUGHED_C)) {
        rtile.add([k.sprite(PLOUGHED_TAG)]);
    }
    if (tile.has(PLANTED_C) || tile.has(RIPE_C)) {
        const child = rtile.add([k.sprite(SEEDS_TAG)]);
        child.scale = 3;

        const water = tile.get(WATERED_C);
        if (water !== undefined) {
            k.debug.log(water);
            child.frame = water.age + 1;
        }
        else if (tile.has(RIPE_C)) {
            child.frame = 3;
        }
    }
}