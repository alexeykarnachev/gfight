import { draw_circle } from "./draw.js";
import { WORLD } from "./world.js";
import { add, scale } from "./geometry.js";

export class Bullet {
    constructor(start_position, velocity) {
        this.start_position = start_position;
        this.position = start_position;
        this.velocity = velocity;
        this.ttl = 2000.0; // milliseconds
        this.size = 0.2;
    }

    draw(color) {
        draw_circle(this.position, this.size / 2.0, color);
    }

    step() {
        this.position = add(
            this.position,
            scale(this.velocity, WORLD.dt / 1000.0)
        );
    }
}
