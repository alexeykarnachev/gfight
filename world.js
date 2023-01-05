export const WORLD = {
    width: 800,
    height: 600,
    pixels_in_meter: 20,

    cursor_pos: null,

    key_states: {},

    dt: 0,
    time: null,

    player: null,
    obstacles: null,
    guys: null,
};

WORLD.update_time = () => {
    let now = Date.now();
    if (WORLD.time != null) {
        WORLD.dt = now - WORLD.time;
    }
    WORLD.time = now;
};

export function num_to_world(x) {
    return x * WORLD.pixels_in_meter;
}

export function vec2_to_world(v) {
    return [v[0] * WORLD.pixels_in_meter, v[1] * WORLD.pixels_in_meter];
}

export function num_to_local(x) {
    return x / WORLD.pixels_in_meter;
}

export function vec2_to_local(v) {
    return [v[0] / WORLD.pixels_in_meter, v[1] / WORLD.pixels_in_meter];
}
