import {
    STEP_DIRECTION,
    ROTATION_DIRECTION,
    GUY_TAG,
} from "./constants.js";

export class TowerAIController {
    constructor() {}

    update(guy) {
        let observations = guy.observe_world();
        let mid = Math.floor(observations.length / 2);
        for (let i = 0; i < observations.length; ++i) {
            let observation = observations[i];
            let target = observation.target;
            if (target.tag === GUY_TAG.PLAYER) {
                guy.look_at(observation.position);
                guy.shoot();
            }
        }
    }
}
