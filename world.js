export const WORLD = {
    eps: 0.00001,

    width: 800,
    height: 600,
    pixels_in_meter: 20,

    canvas: null,
    context: null,

    cursor_pos: null,

    key_states: {},
    mouse_states: {},

    dt: 0.0,
    time: 0.0,
    last_timestamp: null,

    obstacles: [],
    guys: [],
    bullets: [],
};

export function reset_world() {
    WORLD.key_states = {};
    WORLD.mouse_states = {};
    WORLD.dt = 0.0;
    WORLD.time = 0.0;
    WORLD.last_timestamp = null;
    WORLD.obstacles = [];
    WORLD.guys = [];
    WORLD.bullets = [];
}

export function get_world_size_in_meters() {
    return [
        WORLD.width / WORLD.pixels_in_meter,
        WORLD.height / WORLD.pixels_in_meter,
    ];
}

export function spawn_guy(guy) {
    WORLD.guys.push(guy);
}

export function spawn_obstacle(obstacle) {
    WORLD.obstacles.push(obstacle);
}

export function spawn_bullet(bullet) {
    WORLD.bullets.push(bullet);
}

function update_world_time(dt) {
    if (dt != null) {
        WORLD.time += dt;
        WORLD.dt = dt;
    } else {
        let now = Date.now();
        if (WORLD.last_timestamp != null) {
            WORLD.dt = now - WORLD.last_timestamp;
            WORLD.time += WORLD.dt;
        }
    }

    WORLD.last_timestamp = Date.now();
}

export function update_world(dt) {
    update_world_time(dt);
    let new_guys = [];
    for (let guy of WORLD.guys) {
        guy = guy.update();
        if (guy != null) {
            new_guys.push(guy);
        }
    }
    let new_bullets = [];
    for (let bullet of WORLD.bullets) {
        bullet = bullet.update();
        if (bullet != null) {
            new_bullets.push(bullet);
        }
    }
    WORLD.guys = new_guys;
    WORLD.bullets = new_bullets;
}

export function draw_world() {
    WORLD.context.clearRect(0, 0, WORLD.canvas.width, WORLD.canvas.height);
    WORLD.bullets.map((b) => b.draw());
    WORLD.guys.map((g) => g.draw());
    WORLD.obstacles.map((o) => o.draw("gray"));
}

export function create_world_canvas() {
    WORLD.canvas = document.createElement("canvas");
    WORLD.context = WORLD.canvas.getContext("2d");
    WORLD.canvas.width = WORLD.width;
    WORLD.canvas.height = WORLD.height;
    WORLD.canvas.addEventListener("mousemove", (event) => {
        let rect = WORLD.canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        WORLD.cursor_pos = [x, y];
    });

    document.body.appendChild(WORLD.canvas);
}

window.addEventListener("keydown", (event) => {
    WORLD.key_states[event.key] = 1;
});

window.addEventListener("mousedown", (event) => {
    WORLD.mouse_states[event.button] = 1;
});

window.addEventListener("keyup", (event) => {
    WORLD.key_states[event.key] = 0;
});

window.addEventListener("mouseup", (event) => {
    WORLD.mouse_states[event.button] = 0;
});

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
