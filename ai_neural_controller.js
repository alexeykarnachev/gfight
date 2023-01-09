import { get_dist_between_points } from "./geometry.js";
import {
    GUY_TAG,
    STEP_DIRECTION,
    STEP_DIRECTION_NAMES,
} from "./constants.js";

export class AINeuralController {
    constructor(guy) {
        this.guy = guy;

        // View dist + tag (1/0 - guy or not a guy)
        this.x_dim = guy.n_view_rays * 2.0;

        // View rays + steps + shoot
        this.y_dim = guy.n_view_rays + STEP_DIRECTION_NAMES.length + 1;

        let hidden_dim = Math.floor(this.x_dim / 2);

        this.hidden_dims = [hidden_dim, hidden_dim];
        this.layers = [];
        for (let i = 0; i < this.hidden_dims.length + 1; ++i) {
            let inp_dim = i > 0 ? this.hidden_dims[i - 1] : this.x_dim;
            let out_dim =
                i < this.hidden_dims.length
                    ? this.hidden_dims[i]
                    : this.y_dim;
            this.layers.push(init_layer(inp_dim, out_dim));
        }
    }

    update() {
        let observations = this.guy.observe_world();
        let distances = observations.map(
            (o) =>
                get_dist_between_points(this.guy.position, o.position) /
                this.guy.view_dist
        );
        let tags = observations.map((o) =>
            o.target.tag != null ? 1.0 : 0.0
        );
        let x = [...distances, ...tags];
        let y = forward(x, this.layers);

        let observation_scores = y.slice(0, this.guy.n_view_rays);
        let step_direction_scores = y.slice(
            this.guy.n_view_rays,
            this.guy.n_view_rays + STEP_DIRECTION_NAMES.length
        );
        let shoot_score = y[y.length - 1];
        if (
            observation_scores.length +
                step_direction_scores.length +
                1 !==
            y.length
        ) {
            throw "[ERROR] Wrong number of output y values. This is a bug in the AINeuralController";
        }

        let observation = observations[argmax(observation_scores)];
        let step_direction =
            STEP_DIRECTION[
                STEP_DIRECTION_NAMES[argmax(step_direction_scores)]
            ];
        let is_shoot = shoot_score > 0.0;

        this.guy.look_at(observation.position);
        this.guy.step(step_direction);
        if (is_shoot) {
            this.guy.shoot();
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

function forward(x, layers) {
    let inp = x;
    let out;
    for (let i_layer = 0; i_layer < layers.length; ++i_layer) {
        inp = [...inp, 1.0]; // Dummy variable
        let layer = layers[i_layer];
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
            if (i_layer < layers.length - 1) {
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
