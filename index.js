import { Line, Triangle, Rectangle, Circle } from "./primitives.js";
import { Guy } from "./guy.js";
import { draw_circle } from "./draw.js";
import { WORLD, vec2_to_local } from "./world.js";
import { COLLISION_TAG } from "./collision.js";
import {
    intersect_circles,
    intersect_line_with_circle,
} from "./geometry.js";

const CANVAS = document.createElement("canvas");
const CONTEXT = CANVAS.getContext("2d");
CANVAS.width = WORLD.width;
CANVAS.height = WORLD.height;
document.body.appendChild(CANVAS);

CANVAS.addEventListener("mousemove", (event) => {
    let rect = CANVAS.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    WORLD.cursor_pos = [x, y];
});

window.addEventListener("keydown", (event) => {
    WORLD.key_states[event.key] = 1;
});

window.addEventListener("keyup", (event) => {
    WORLD.key_states[event.key] = 0;
});

function main_loop() {
    CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);

    WORLD.player.draw(CONTEXT, "orange", "gray");
    for (let obstacle of WORLD.obstacles) {
        obstacle.draw(CONTEXT, "gray");
    }
    for (let guy of WORLD.guys) {
        guy.draw(CONTEXT, "pink");
    }

    let observations = WORLD.player.observe(WORLD.obstacles, WORLD.guys);
    for (let observation of observations) {
        for (let position of observation.positions) {
            draw_circle(position, 0.2, CONTEXT, "white");
        }
    }

    let collisions = WORLD.player.collide(WORLD.obstacles, WORLD.guys);
    for (let collision of collisions) {
        for (let position of collision.positions) {
            draw_circle(position, 0.2, CONTEXT, "red");
            console.log(position);
        }
    }

    if (WORLD.cursor_pos != null) {
        WORLD.player.look_at(vec2_to_local(WORLD.cursor_pos), WORLD.dt);
    }

    let eps = 0.00001;
    let move_dir = [0, 0];
    if (WORLD.key_states["w"] == 1) {
        move_dir[1] -= 1.0;
    }
    if (WORLD.key_states["s"] == 1) {
        move_dir[1] += 1.0;
    }
    if (WORLD.key_states["a"] == 1) {
        move_dir[0] -= 1.0;
    }
    if (WORLD.key_states["d"] == 1) {
        move_dir[0] += 1.0;
    }
    if (Math.abs(move_dir[0]) > eps || Math.abs(move_dir[1]) > eps) {
        WORLD.player.move(move_dir, WORLD.dt);
    }

    WORLD.update_time();
    requestAnimationFrame(main_loop);
}

function main() {
    WORLD.player = new Guy([10, 10]);
    WORLD.guys = [new Guy([18, 18]), new Guy([15, 18]), new Guy([15, 5])];
    WORLD.obstacles = [
        new Rectangle([15, 14], 4, 2),
        new Circle([15, 10], 2),
        new Circle([10, 15], 2),
        new Triangle([20, 1], [17, 2], [19, 10]),
    ];

    requestAnimationFrame(main_loop);
}

main();
