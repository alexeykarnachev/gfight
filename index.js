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

    spawn_guy(new Guy(GUY_TAG.PLAYER, [3, 27]));
    spawn_guy(new Guy(GUY_TAG.NEURAL_AI, [37, 3]));

    spawn_obstacle(new Rectangle([0, 0], 40, 1));
    spawn_obstacle(new Rectangle([39, 1], 1, 28));
    spawn_obstacle(new Rectangle([0, 29], 40, 1));
    spawn_obstacle(new Rectangle([0, 1], 1, 28));

    spawn_obstacle(new Rectangle([15, 8], 1, 19));

    spawn_obstacle(new Circle([25, 10], 4));
    spawn_obstacle(new Triangle([25, 23], [27, 23], [29, 18]));

    requestAnimationFrame(main_loop);
}

main();
