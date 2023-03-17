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
import { GUY_TAG, SCORES } from "./constants.js";
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

let MUTATION_STRENGTH = 0.1;
let N_GENERATIONS = 100;
let GENERATION_SIZE = 1000;
let ELITE_SIZE = 100;
let MUTATION_RATE = 0.1;
let SIMULATION_TIME = 30_000; // Milliseconds
let SIMULATION_DT = 17; // Milliseconds


let ANIMATE = false;
let ANIMATE_BUTTON = document.createElement("button");
ANIMATE_BUTTON.style.cssFloat = 'right';
ANIMATE_BUTTON.innerHTML = "SHOW BEST";
document.body.appendChild(ANIMATE_BUTTON);
ANIMATE_BUTTON.addEventListener("click", ()=>{
    ANIMATE = !ANIMATE;
    if (ANIMATE) {
        ANIMATE_BUTTON.innerHTML = "STOP";
    } else {
        ANIMATE_BUTTON.innerHTML = "ANIMATE";
    }
});


async function train() {
    GENERATION_SIZE = Math.floor(GENERATION_SIZE / 2) * 2;

    let generation = [];
    for (let i = 0; i < GENERATION_SIZE; ++i) {
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
    for (let i_gen = 0; i_gen < N_GENERATIONS; ++i_gen) {
        let generation_score = null;
        for (let i_step = 0; i_step < generation.length - 1; i_step += 2) {
            let guy0 = generation[i_step];
            let guy1 = generation[i_step + 1];

            reset_world();
            spawn_guy(guy0);
            spawn_guy(guy1);
            spawn_obstacles();

            let time_remained = SIMULATION_TIME;
            while (time_remained > 0) {
                update_world(SIMULATION_DT);
                time_remained -= SIMULATION_DT;
                guy0.score += SCORES.SIMULATION_STEP;
                guy1.score += SCORES.SIMULATION_STEP;
            }

            let step_score = Math.max(guy0.score, guy1.score);
            if (best_score == null) {
                best_score = step_score;
            } else {
                best_score = Math.max(best_score, step_score);
            }

            if (generation_score == null) {
                generation_score = step_score;
            } else {
                generation_score = Math.max(generation_score, step_score);
            }

            console.log(`Generation: ${i_gen + 1}/${N_GENERATIONS}, Step: ${ i_step + 2 }/${generation.length}, Step scores: [${guy0.score}, ${guy1.score}], Generation score: ${generation_score}, Best score: ${best_score}`);

            if (ANIMATE) {
                await draw_generation(generation.slice(0, i_step + 2));
            }

            await sleep(30.0);
        }

        generation = create_new_generation(
            generation,
            ELITE_SIZE,
            MUTATION_RATE
        );
    }
}

async function draw_generation(generation) {
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

    console.log(`Animating guys with scores: ${generation[0].score} VS ${generation[1].score}`);

    reset_world();
    spawn_guy(guy0);
    spawn_guy(guy1);
    spawn_obstacles();

    function draw_step() {
        update_world();
        draw_world();
        if (ANIMATE) {
            requestAnimationFrame(draw_step);
        }
    }

    requestAnimationFrame(draw_step);
    while (ANIMATE) {
        await sleep(500.0);
    }
}

function create_new_generation(generation, ELITE_SIZE, MUTATION_RATE) {
    generation.sort(guys_comparator);

    let elite_brains = generation
        .slice(0, ELITE_SIZE)
        .map((g) => g.controller.brain);

    let children_brains = [];
    for (let i = 0; i < generation.length - elite_brains.length; ++i) {
        let parent_brain0 = choose(elite_brains);
        let parent_brain1 = choose(elite_brains);
        let child_brain = crossover(
            parent_brain0,
            parent_brain1,
            MUTATION_RATE
        );
        children_brains.push(child_brain);
    }

    let new_brains = [...elite_brains, ...children_brains];
    new_brains = shuffle(new_brains);
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

    return new_generation;
}

function crossover(brain0, brain1, MUTATION_RATE) {
    let brain = brain0.map((a) => a.slice());
    for (let i = 0; i < brain0.length; ++i) {
        for (let j = 0; j < brain0[i].length; ++j) {
            let weight = Math.random() < 0.5 ? brain0[i][j] : brain1[i][j];
            if (Math.random < MUTATION_RATE) {
                weight += (Math.random() * 2.0 - 1.0) * MUTATION_STRENGTH;
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
