import { WORLD } from "./world.js";
import { STEP_DIRECTION } from "./constants.js";
import { vec2_to_local } from "./world.js";

export class ManualController {
    constructor(guy) {
        this.guy = guy;
    }

    update() {
        if (WORLD.cursor_pos != null) {
            this.guy.look_at(vec2_to_local(WORLD.cursor_pos));
        }

        if (WORLD.key_states["w"] == 1 && WORLD.key_states["d"] == 1) {
            this.guy.step(STEP_DIRECTION.FORWARD_RIGHT);
        } else if (
            WORLD.key_states["w"] == 1 &&
            WORLD.key_states["a"] == 1
        ) {
            this.guy.step(STEP_DIRECTION.FORWARD_LEFT);
        } else if (
            WORLD.key_states["s"] == 1 &&
            WORLD.key_states["d"] == 1
        ) {
            this.guy.step(STEP_DIRECTION.BACK_RIGHT);
        } else if (
            WORLD.key_states["s"] == 1 &&
            WORLD.key_states["a"] == 1
        ) {
            this.guy.step(STEP_DIRECTION.BACK_LEFT);
        } else if (WORLD.key_states["w"] == 1) {
            this.guy.step(STEP_DIRECTION.FORWARD);
        } else if (WORLD.key_states["s"] == 1) {
            this.guy.step(STEP_DIRECTION.BACK);
        } else if (WORLD.key_states["d"] == 1) {
            this.guy.step(STEP_DIRECTION.RIGHT);
        } else if (WORLD.key_states["a"] == 1) {
            this.guy.step(STEP_DIRECTION.LEFT);
        }

        if (WORLD.mouse_states[0] == 1) {
            this.guy.shoot();
        }
    }
}
