import { Line, Triangle, Rectangle, Circle } from "./primitives.js";
import { Guy, STEP_DIRECTION, ROTATION_DIRECTION } from "./guy.js";
import { draw_circle, draw_line } from "./draw.js";
import { WORLD, vec2_to_local } from "./world.js";
import {
    COLLISION_TAG,
    collide_primitive_with_world,
    observe_world,
} from "./collision.js";

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

    let observations = observe_world(WORLD.player.get_view_rays());
    for (let observation of observations) {
        for (let position of observation.positions) {
            draw_circle(position, 0.2, CONTEXT, "white");
        }
    }

    let collisions = collide_primitive_with_world(
        WORLD.player.get_circle(),
        WORLD
    );
    for (let collision of collisions) {
        for (let i = 0; i < collision.positions.length; ++i) {
            let position = collision.positions[i];
            let normal = collision.normals[i];
            let end = [position[0] + normal[0], position[1] + normal[1]];
            draw_circle(position, 0.2, CONTEXT, "red");
            draw_line(position, end, CONTEXT, "red");
        }
        for (let normal of collision.normals) {
        }
    }

    if (WORLD.cursor_pos != null) {
        WORLD.player.look_at(vec2_to_local(WORLD.cursor_pos), WORLD.dt);
    }

    if (WORLD.key_states["w"] == 1) {
        WORLD.player.step(STEP_DIRECTION.FORWARD);
    } else if (WORLD.key_states["s"] == 1) {
        WORLD.player.step(STEP_DIRECTION.BACK);
    } else if (WORLD.key_states["d"] == 1) {
        WORLD.player.step(STEP_DIRECTION.RIGHT);
    } else if (WORLD.key_states["a"] == 1) {
        WORLD.player.step(STEP_DIRECTION.LEFT);
    } else if (WORLD.key_states["ArrowLeft"] == 1) {
        WORLD.player.rotate(ROTATION_DIRECTION.LEFT);
    } else if (WORLD.key_states["ArrowRight"] == 1) {
        WORLD.player.rotate(ROTATION_DIRECTION.RIGHT);
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
