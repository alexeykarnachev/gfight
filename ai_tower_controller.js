import { GUY_TAG } from "./constants.js";

export class AITowerController {
    constructor(guy) {
        this.guy = guy;
    }

    update() {
        let observations = this.guy.observe_world();
        let mid = Math.floor(observations.length / 2);
        for (let i = 0; i < observations.length; ++i) {
            let observation = observations[i];
            let target = observation.target;
            if (target.tag === GUY_TAG.PLAYER) {
                this.guy.look_at(observation.position);
                this.guy.shoot();
            }
        }
    }
}
