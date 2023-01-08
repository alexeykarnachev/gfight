import { Triangle, Rectangle, Circle } from "./primitives.js";
import { Guy, STEP_DIRECTION, ROTATION_DIRECTION } from "./guy.js";
import {
    WORLD,
    clear_world_canvas,
    update_world_time,
    create_world_canvas,
    vec2_to_local,
    spawn_obstacle,
    spawn_guy,
} from "./world.js";
import { rotate } from "./geometry.js";

let PLAYER;

function main_loop() {
    clear_world_canvas();

    for (let obstacle of WORLD.obstacles) {
        obstacle.draw("gray");
    }

    for (let guy of WORLD.guys) {
        if (guy === PLAYER) {
            guy.draw("orange", "gray");
        } else {
            guy.draw("pink");
        }
    }

    for (let bullet of WORLD.bullets) {
        bullet.step();
        bullet.draw("red");
    }

    let observations = PLAYER.observe_world();

    if (WORLD.cursor_pos != null) {
        PLAYER.look_at(vec2_to_local(WORLD.cursor_pos));
    }

    if (WORLD.key_states["w"] == 1 && WORLD.key_states["d"] == 1) {
        PLAYER.step(STEP_DIRECTION.FORWARD_RIGHT);
    } else if (WORLD.key_states["w"] == 1 && WORLD.key_states["a"] == 1) {
        PLAYER.step(STEP_DIRECTION.FORWARD_LEFT);
    } else if (WORLD.key_states["s"] == 1 && WORLD.key_states["d"] == 1) {
        PLAYER.step(STEP_DIRECTION.BACK_RIGHT);
    } else if (WORLD.key_states["s"] == 1 && WORLD.key_states["a"] == 1) {
        PLAYER.step(STEP_DIRECTION.BACK_LEFT);
    } else if (WORLD.key_states["w"] == 1) {
        PLAYER.step(STEP_DIRECTION.FORWARD);
    } else if (WORLD.key_states["s"] == 1) {
        PLAYER.step(STEP_DIRECTION.BACK);
    } else if (WORLD.key_states["d"] == 1) {
        PLAYER.step(STEP_DIRECTION.RIGHT);
    } else if (WORLD.key_states["a"] == 1) {
        PLAYER.step(STEP_DIRECTION.LEFT);
    } else if (WORLD.key_states["ArrowLeft"] == 1) {
        PLAYER.rotate(ROTATION_DIRECTION.LEFT);
    } else if (WORLD.key_states["ArrowRight"] == 1) {
        PLAYER.rotate(ROTATION_DIRECTION.RIGHT);
    }

    if (WORLD.mouse_states[0] == 1) {
        PLAYER.shoot();
    }

    update_world_time();
    requestAnimationFrame(main_loop);
}

function main() {
    create_world_canvas();
    PLAYER = new Guy([10, 10]);

    spawn_guy(PLAYER);
    spawn_guy(new Guy([18, 18]));
    spawn_guy(new Guy([15, 18]));
    spawn_guy(new Guy([15, 5]));

    spawn_obstacle(new Rectangle([15, 14], 4, 2));
    spawn_obstacle(new Rectangle([0, 5], 10, 2));
    spawn_obstacle(new Rectangle([0, 0], 10, 1));
    spawn_obstacle(new Rectangle([0, 0], 1, 10));
    spawn_obstacle(new Circle([15, 10], 2));
    spawn_obstacle(new Circle([10, 15], 2));
    spawn_obstacle(new Triangle([20, 1], [17, 2], [19, 10]));
    spawn_obstacle(new Triangle([2, 15], [3, 10], [4, 10]));

    requestAnimationFrame(main_loop);
}

main();
