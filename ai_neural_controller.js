import { get_dist_between_points } from "./geometry.js";
import {
    GUY_TAG,
    STEP_DIRECTION,
    STEP_DIRECTION_NAMES,
} from "./constants.js";
import { WORLD, reset_world } from "./world.js";

export class AINeuralController {
    constructor(brain) {
        this.brain = brain;
    }

    update(guy) {
        if (this.brain == null) {
            this.brain = get_random_brain(guy);
        }

        let brain_dim = get_brain_dim(this.brain);
        let guy_dim = get_guy_dim(guy);
        if (
            brain_dim[0] - 1 !== guy_dim[0] ||
            brain_dim[1] !== guy_dim[1]
        ) {
            console.log(brain_dim, guy_dim);
            throw "[ERROR] The brain doesn't fit the guy";
        }

        let observations = guy.observe_world();
        let distances = observations.map(
            (o) =>
                get_dist_between_points(guy.position, o.position) /
                guy.view_dist
        );
        let tags = observations.map((o) =>
            o.target.tag != null ? 1.0 : 0.0
        );
        let x = [...distances, ...tags];
        let y = forward(x, this.brain);

        let observation_scores = y.slice(0, guy.n_view_rays);
        let step_direction_scores = y.slice(
            guy.n_view_rays,
            guy.n_view_rays + STEP_DIRECTION_NAMES.length
        );
        let shoot_score = y[y.length - 1];

        let observation = observations[argmax(observation_scores)];
        let step_direction =
            STEP_DIRECTION[
                STEP_DIRECTION_NAMES[argmax(step_direction_scores)]
            ];
        let is_shoot = shoot_score > 0.0;

        guy.look_at(observation.position);
        guy.step(step_direction);
        if (is_shoot) {
            guy.shoot();
        }
    }
}

function init_layer(inp_dim, out_dim) {
    inp_dim += 1; // Dummy variable
    let weights = new Array(out_dim);
    for (let i = 0; i < out_dim; ++i) {
        weights[i] = new Array(inp_dim);
        for (let j = 0; j < inp_dim; ++j) {
            weights[i][j] = Math.random() * 2.0 - 1.0;
        }
    }

    return weights;
}

function get_guy_dim(guy) {
    // View dist + tag (1/0 - guy or not a guy)
    let x_dim = guy.n_view_rays * 2.0;
    // View rays + steps + shoot
    let y_dim = guy.n_view_rays + STEP_DIRECTION_NAMES.length + 1;
    return [x_dim, y_dim];
}

function get_brain_dim(brain) {
    let x_dim = brain[0][0].length;
    let y_dim = brain[brain.length - 1].length;
    return [x_dim, y_dim];
}

export function get_random_brain(guy) {
    let guy_dim = get_guy_dim(guy);
    let hidden_dims = [10, 10];
    let brain = [];
    for (let i = 0; i < hidden_dims.length + 1; ++i) {
        let inp_dim = i > 0 ? hidden_dims[i - 1] : guy_dim[0];
        let out_dim = i < hidden_dims.length ? hidden_dims[i] : guy_dim[1];
        brain.push(init_layer(inp_dim, out_dim));
    }

    return brain;
}

function forward(x, brain) {
    let inp = x;
    let out;
    for (let i_layer = 0; i_layer < brain.length; ++i_layer) {
        inp = [...inp, 1.0]; // Dummy variable
        let layer = brain[i_layer];
        let inp_dim = inp.length;
        let out_dim = layer.length;
        out = new Array(out_dim);
        for (let i_row = 0; i_row < out_dim; ++i_row) {
            let z = 0.0;
            let row = layer[i_row];
            for (let i_col = 0; i_col < inp_dim; ++i_col) {
                z += row[i_col] * inp[i_col];
            }

            // Apply relu for all layers except the output one
            if (i_layer < brain.length - 1) {
                out[i_row] = Math.max(0.0, z);
            } else {
                out[i_row] = z;
            }
        }
        inp = out;
    }

    return out;
}

function argmax(arr) {
    return arr.reduce((max_idx, curr_val, curr_idx, vals) => {
        return curr_val > vals[max_idx] ? curr_idx : max_idx;
    }, 0);
}
