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
import { argmax, sleep, shuffle } from "./utils.js";

let OBSTACLES = [
    new Rectangle([0, 0], 40, 1),
    new Rectangle([39, 1], 1, 28),
    new Rectangle([0, 29], 40, 1),
    new Rectangle([0, 1], 1, 28),
    new Rectangle([15, 8], 1, 19),
    new Circle([25, 10], 4),
    new Triangle([25, 23], [27, 23], [29, 18]),
];

function spawn_obstacles() {
    OBSTACLES.map((o) => spawn_obstacle(o));
}

async function train() {
    let n_generations = 100;
    let generation_size = 200;
    let elite_size = 20;
    let mutation_rate = 0.1;
    let simulation_time = 60_000; // Milliseconds
    let simulation_dt = 17; // Milliseconds
    let animation_time = 40_000;

    let generation = [];
    for (let i = 0; i < generation_size; ++i) {
        let position = i % 2 == 0 ? [3, 27] : [37, 3];
        let guy = new Guy(
            GUY_TAG.NEURAL_AI,
            position,
            true,
            new AINeuralController(null)
        );
        generation.push(guy);
    }

    let best_score = null;
    for (let i_gen = 0; i_gen < n_generations; ++i_gen) {
        for (let i_step = 0; i_step + 1 < generation_size; i_step += 2) {
            let guy0 = generation[i_step];
            let guy1 = generation[i_step + 1];

            reset_world();
            spawn_guy(guy0);
            spawn_guy(guy1);
            spawn_obstacles();

            let time_remained = simulation_time;
            while (time_remained > 0) {
                update_world(simulation_dt);
                time_remained -= simulation_dt;
            }

            let step_score = Math.max(guy0.score, guy1.score);
            if (best_score == null) {
                best_score = step_score;
            } else {
                best_score = Math.max(best_score, step_score);
            }
            console.log(
                `Generation: ${i_gen + 1}/${n_generations}, Step: ${
                    i_step + 2
                }/${generation_size}, Step score: ${step_score}, Best score: ${best_score}`
            );
            await sleep(50.0);
        }

        await draw_generation(generation, animation_time);
        generation = create_new_generation(
            generation,
            elite_size,
            mutation_rate
        );
    }
}

async function draw_generation(generation, animation_time) {
    if (WORLD.canvas == null) {
        create_world_canvas();
    }
    generation.sort(guys_comparator);
    let guy0 = new Guy(
        GUY_TAG.NEURAL_AI,
        [3, 27],
        true,
        generation[0].controller
    );
    let guy1 = new Guy(
        GUY_TAG.NEURAL_AI,
        [37, 3],
        true,
        generation[1].controller
    );

    reset_world();
    spawn_guy(guy0);
    spawn_guy(guy1);
    spawn_obstacles();

    function draw_step() {
        update_world();
        draw_world();
        if (WORLD.time < animation_time) {
            requestAnimationFrame(draw_step);
        }
    }

    requestAnimationFrame(draw_step);
    await sleep(animation_time + 1000);
}

function create_new_generation(generation, elite_size, mutation_rate) {
    generation.sort(guys_comparator);

    let elite_brains = generation
        .slice(0, elite_size)
        .map((g) => g.controller.brain);

    let children_brains = [];
    for (let i = 0; i < generation.length - elite_brains.length; ++i) {
        let parent_brain0 = choose(elite_brains);
        let parent_brain1 = choose(elite_brains);
        let child_brain = crossover(
            parent_brain0,
            parent_brain1,
            mutation_rate
        );
        children_brains.push(child_brain);
    }

    let new_brains = [...elite_brains, ...children_brains];
    let new_generation = [];
    for (let i = 0; i < new_brains.length; ++i) {
        let position = i % 2 == 0 ? [3, 27] : [37, 3];
        let guy = new Guy(
            GUY_TAG.NEURAL_AI,
            position,
            true,
            new AINeuralController(new_brains[i])
        );
        new_generation.push(guy);
    }

    new_generation = shuffle(new_generation);
    return new_generation;
}

function crossover(brain0, brain1, mutation_rate) {
    let brain = brain0.map((a) => a.slice());
    for (let i = 0; i < brain0.length; ++i) {
        for (let j = 0; j < brain0[i].length; ++j) {
            let weight = Math.random() < 0.5 ? brain0[i][j] : brain1[i][j];
            if (Math.random < mutation_rate) {
                weight += (Math.random() * 2.0 - 1.0) * 0.1;
            }
            brain[i][j] = weight;
        }
    }

    return brain;
}

function guys_comparator(g0, g1) {
    if (g0.score < g1.score) {
        return 1;
    }
    if (g0.score > g1.score) {
        return -1;
    }
    return 0;
}

function choose(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
}

train();
