import { draw_circle, draw_line } from "./draw.js";
import { WORLD } from "./world.js";
import { add, sub, scale } from "./geometry.js";
import { Line } from "./primitives.js";
import { collide_object_with_world } from "./collision.js";

export class Bullet {
    constructor(start_position, velocity, owner) {
        this.start_position = start_position;
        this.position = start_position;
        this.velocity = velocity;
        this.owner = owner;
        this.ttl = 2000.0;
    }

    draw(color) {
        draw_circle(this.position, 0.15, color);
    }

    get_primitive() {
        // Bullet is represented as a short line.
        // Such the representation is more robust and convinient
        // to compute collisions with the world.
        let step = scale(this.velocity, WORLD.dt / 1000.0);
        let start = sub(this.position, step);
        let end = add(this.position, scale(step, 0.75));

        return new Line(start, end);
    }

    step() {
        this.position = add(
            this.position,
            scale(this.velocity, WORLD.dt / 1000.0)
        );

        let collisions = collide_object_with_world(this);
        let collision = collisions.find((c) => c.target !== this.owner);
        if (collision == null) {
            return;
        }
        this.ttl = 0.0;
    }
}
