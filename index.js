import { Line, Triangle, Rectangle, Circle } from "./primitives.js";
import { Guy, STEP_DIRECTION, ROTATION_DIRECTION } from "./guy.js";
import { draw_circle, draw_line } from "./draw.js";
import {
    WORLD,
    clear_world_canvas,
    update_world_time,
    create_world_canvas,
    vec2_to_local,
} from "./world.js";
import {
    COLLISION_TAG,
    collide_primitive_with_world,
} from "./collision.js";
import { rotate } from "./geometry.js";

function main_loop() {
    clear_world_canvas();

    WORLD.player.draw("orange", "gray");
    for (let obstacle of WORLD.obstacles) {
        obstacle.draw("gray");
    }
    for (let guy of WORLD.guys) {
        guy.draw("pink");
    }

    let observations = WORLD.player.observe_world();

    if (WORLD.cursor_pos != null) {
        WORLD.player.look_at(vec2_to_local(WORLD.cursor_pos));
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

    update_world_time();
    requestAnimationFrame(main_loop);
}

function main() {
    create_world_canvas();
    WORLD.player = new Guy([10, 10]);
    WORLD.guys = [new Guy([18, 18]), new Guy([15, 18]), new Guy([15, 5])];
    WORLD.obstacles = [
        new Rectangle([15, 14], 4, 2),
        new Rectangle([0, 5], 10, 2),
        new Circle([15, 10], 2),
        new Circle([10, 15], 2),
        new Triangle([20, 1], [17, 2], [19, 10]),
    ];

    requestAnimationFrame(main_loop);
}

main();
