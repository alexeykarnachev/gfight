import { Triangle, Rectangle, Circle } from "./primitives.js";
import { Guy } from "./guy.js";
import {
    WORLD,
    create_world_canvas,
    spawn_obstacle,
    spawn_guy,
    update_world,
    draw_world,
} from "./world.js";
import { rotate } from "./geometry.js";
import { GUY_TAG } from "./constants.js";

function main_loop() {
    update_world();
    draw_world();
    requestAnimationFrame(main_loop);
}

function main() {
    create_world_canvas();

    spawn_guy(new Guy(GUY_TAG.PLAYER, [10, 10]));
    spawn_guy(new Guy(GUY_TAG.DUMMY_AI, [18, 18]));
    spawn_guy(new Guy(GUY_TAG.DUMMY_AI, [15, 18]));
    spawn_guy(new Guy(GUY_TAG.DUMMY_AI, [15, 5]));

    spawn_obstacle(new Rectangle([15, 14], 4, 2));
    spawn_obstacle(new Rectangle([0, 5], 10, 2));
    spawn_obstacle(new Rectangle([0, 0], 10, 2));
    spawn_obstacle(new Rectangle([0, 0], 1, 10));
    spawn_obstacle(new Circle([15, 10], 2));
    spawn_obstacle(new Circle([10, 15], 2));
    spawn_obstacle(new Triangle([20, 1], [17, 2], [19, 10]));
    spawn_obstacle(new Triangle([2, 15], [3, 10], [4, 10]));

    requestAnimationFrame(main_loop);
}

main();
