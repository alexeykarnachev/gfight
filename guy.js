import { draw_line, draw_circle } from "./draw.js";
import { Line } from "./primitives.js";
import { rotate, get_nearest_point } from "./geometry.js";

export class Guy {
    constructor(position) {
        this.size = 2.0;
        this.move_speed = 2.0;
        this.rotation_speed = 0.5 * Math.PI;
        this.view_angle = Math.PI;
        this.view_dist = 20.0;
        this.n_view_rays = 17;

        this.position = position;
        this.orientation = 0.0; // Angle in radians
    }

    draw(context, color) {
        let rays = this.get_view_rays();
        for (let ray of rays) {
            draw_line(ray.start, ray.end, context, "rgb(60,60,60)");
        }
        draw_circle(this.position, this.size / 2.0, context, color);
    }

    get_view_rays() {
        let rays = [];
        let start_ray = [
            this.position[0] + this.view_dist,
            this.position[1],
        ];
        let step = this.view_angle / (this.n_view_rays - 1);

        for (let i = 0; i < this.n_view_rays; ++i) {
            let ray = rotate(
                start_ray,
                this.position,
                -this.orientation - 0.5 * this.view_angle + i * step
            );
            rays.push(new Line([this.position[0], this.position[1]], ray));
        }

        return rays;
    }

    observe(objects) {
        let view_rays = this.get_view_rays();
        let collisions = [];
        for (let ray of view_rays) {
            let ray_collisions = [];
            for (let object of objects) {
                let collision = object.collide_with_line(ray);
                if (collision != null) {
                    ray_collisions.push(collision);
                }
            }
            let nearest_collision = get_nearest_point(
                ray.start,
                ray_collisions
            );
            collisions.push(nearest_collision);
        }
        return collisions;
    }
}
