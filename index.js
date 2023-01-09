import { Triangle, Rectangle, Circle } from "./primitives.js";
import { Guy } from "./guy.js";
import {
    WORLD,
    create_world_canvas,
    spawn_obstacle,
    spawn_guy,
    update_world,
    draw_world,
    reset_world,
} from "./world.js";
import { rotate } from "./geometry.js";
import { GUY_TAG } from "./constants.js";
import {
    AINeuralController,
    get_random_brain,
} from "./ai_neural_controller.js";

function main_loop() {
    update_world();
    draw_world();
    requestAnimationFrame(main_loop);
}

function train() {
    let obstacles = [
        new Rectangle([0, 0], 40, 1),
        new Rectangle([39, 1], 1, 28),
        new Rectangle([0, 29], 40, 1),
        new Rectangle([0, 1], 1, 28),
        // new Rectangle([15, 8], 1, 19),
        // new Circle([25, 10], 4),
        // new Triangle([25, 23], [27, 23], [29, 18]),
    ];

    let n_generations = 10;
    let generation_size = 10;
    let simulation_time = 6_000; // Milliseconds
    let simulation_dt = 17; // Milliseconds
    for (let i_gen = 0; i_gen < n_generations; ++i_gen) {
        let brain0 = null;
        let brain1 = null;
        for (let i_step = 0; i_step < generation_size; ++i_step) {
            reset_world();

            let guy0 = new Guy(
                GUY_TAG.NEURAL_AI,
                [3, 27],
                true,
                new AINeuralController(brain0)
            );
            let guy1 = new Guy(
                GUY_TAG.NEURAL_AI,
                [37, 3],
                true,
                new AINeuralController(brain1)
            );

            spawn_guy(guy0);
            spawn_guy(guy1);
            obstacles.map((o) => spawn_obstacle(o));

            let time_remained = simulation_time;
            while (time_remained > 0) {
                update_world(simulation_dt);
                time_remained -= simulation_dt;
            }
            console.log(guy0.score, guy1.score);
        }
    }
}

function main() {
    // create_world_canvas();

    // spawn_guy(new Guy(GUY_TAG.NEURAL_AI, [3, 27]));
    // spawn_guy(new Guy(GUY_TAG.NEURAL_AI, [37, 3]));
    // spawn_obstacle(new Rectangle([0, 0], 40, 1));
    // spawn_obstacle(new Rectangle([39, 1], 1, 28));
    // spawn_obstacle(new Rectangle([0, 29], 40, 1));
    // spawn_obstacle(new Rectangle([0, 1], 1, 28));
    // spawn_obstacle(new Rectangle([15, 8], 1, 19));
    // spawn_obstacle(new Circle([25, 10], 4));
    // spawn_obstacle(new Triangle([25, 23], [27, 23], [29, 18]));

    // requestAnimationFrame(main_loop);

    train();
}

main();
