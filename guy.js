import { draw_line, draw_circle } from "./draw.js";
import { Line, Circle } from "./primitives.js";
import {
    rotate,
    get_nearest_point,
    normalize,
    get_radians_diff,
    intersect_line_with_circle,
    get_square_dist_between_points,
    intersect_circles,
    get_circle_normal_at,
} from "./geometry.js";
import {
    COLLISION_TAG,
    Collision,
    collide_primitive_with_world,
    observe_world,
} from "./collision.js";
import { WORLD } from "./world.js";

export class Guy {
    constructor(position) {
        this.size = 2.0;
        this.move_speed = 2.0;
        this.rotation_speed = 2.0 * Math.PI;
        this.move_speed = 5.0;
        this.view_angle = Math.PI;
        this.view_dist = 20.0;
        this.n_view_rays = 21;

        this.position = position;
        this.orientation = 0.0; // Angle in radians
    }

    draw(context, color, view_rays_color) {
        if (view_rays_color != null) {
            let rays = this.get_view_rays();
            rays.map((r) =>
                draw_line(r.start, r.end, context, view_rays_color)
            );
        }
        draw_circle(this.position, this.size / 2.0, context, color);
    }

    get_circle() {
        return new Circle(this.position, this.size / 2.0);
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

    collide_with_line(line) {
        return intersect_line_with_circle(
            line.start,
            line.end,
            this.position,
            this.size / 2.0
        );
    }

    collide_with_circle(circle) {
        return intersect_circles(
            this.position,
            this.size / 2.0,
            circle.position,
            circle.radius
        );
    }

    rotate(direction) {
        let step = (this.rotation_speed * WORLD.dt) / 1000.0;
        this.orientation += direction * step;
    }

    step(direction) {
        let step = (this.move_speed * WORLD.dt) / 1000.0;
        let x_step = Math.cos(this.orientation + direction) * step;
        let y_step = -Math.sin(this.orientation + direction) * step;
        let new_position = [
            this.position[0] + x_step,
            this.position[1] + y_step,
        ];
        let circle = new Circle(new_position, this.size / 2.0);
        let collisions = collide_primitive_with_world(circle);
        // if (collisions.length == 0) {
        this.position[0] += x_step;
        this.position[1] += y_step;
        // }
    }

    look_at(target) {
        let target_view_dir = normalize([
            target[0] - this.position[0],
            target[1] - this.position[1],
        ]);

        let target_orientation = -Math.atan2(
            target_view_dir[1],
            target_view_dir[0]
        );
        let step = (this.rotation_speed * WORLD.dt) / 1000.0;

        let diff = get_radians_diff(target_orientation, this.orientation);
        if (diff <= step) {
            this.orientation = target_orientation;
        } else {
            let new_orientation0 = this.orientation + step;
            let new_orientation1 = this.orientation - step;
            let diff0 = get_radians_diff(
                target_orientation,
                new_orientation0
            );
            let diff1 = get_radians_diff(
                target_orientation,
                new_orientation1
            );
            if (diff0 < diff1) {
                this.orientation = new_orientation0;
            } else {
                this.orientation = new_orientation1;
            }
        }
    }

    get_normal_at(position) {
        return get_circle_normal_at(
            this.position,
            this.size / 2.0,
            position
        );
    }
}

export const STEP_DIRECTION = {
    FORWARD: 0.0,
    RIGHT: -0.5 * Math.PI,
    LEFT: 0.5 * Math.PI,
    BACK: Math.PI,
};

export const ROTATION_DIRECTION = {
    LEFT: 1.0,
    RIGHT: -1.0,
};
