import { draw_line, draw_circle } from "./draw.js";
import { Line, Circle } from "./primitives.js";
import {
    add,
    sub,
    dot,
    scale,
    length,
    rotate,
    get_tangent,
    normalize,
    get_radians_diff,
    intersect_line_with_circle,
    intersect_circles,
    get_circle_normals_at,
    get_nearest_point,
    get_square_dist_between_points,
} from "./geometry.js";
import { collide_object_with_world, Collision } from "./collision.js";
import { WORLD, spawn_bullet } from "./world.js";
import { Bullet } from "./bullet.js";

export class Guy {
    constructor(position) {
        this.health = 1000.0;

        this.size = 2.0;

        this.move_speed = 5.0;
        this.rotation_speed = 8.0 * Math.PI;
        this.shoot_speed = 4.0;
        this.bullet_speed = 50.0;

        this.view_angle = 0.5 * Math.PI;
        this.view_dist = 20.0;
        this.n_view_rays = 31;

        this.position = position;
        this.orientation = 0.0; // Angle in radians
        this.last_time_shoot = 0.0;
    }

    draw(color, view_rays_color, observations_color) {
        if (observations_color != null) {
            let observations = this.observe_world();
            for (let observation of observations) {
                if (observation != null) {
                    draw_circle(
                        observation.position,
                        0.1,
                        observations_color
                    );
                }
            }
        }

        if (view_rays_color != null) {
            let rays = this.get_view_rays();
            rays.map((r) =>
                draw_line(r.start, r.end, 1.0, view_rays_color)
            );
        }
        draw_circle(this.position, this.size / 2.0, color);
    }

    get_view_direction() {
        return [Math.cos(this.orientation), -Math.sin(this.orientation)];
    }

    get_primitive() {
        return new Circle(this.position, this.size / 2.0);
    }

    get_view_rays() {
        let rays = [];
        let start_ray = [
            this.position[0] + this.view_dist,
            this.position[1],
        ];
        let step;
        if (this.n_view_rays == 1) {
            step = 0.0;
        } else {
            step = this.view_angle / (this.n_view_rays - 1);
        }

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

    observe_world() {
        let observations = [];

        let groups = [WORLD.obstacles, WORLD.guys];

        for (let ray of this.get_view_rays()) {
            let nearest_observation = null;
            let nearest_dist = null;

            for (let group of groups) {
                for (let target of group) {
                    if (target === this) {
                        continue;
                    }

                    let position = get_nearest_point(
                        ray.start,
                        target.collide_with_line(ray)
                    );
                    if (position == null) {
                        continue;
                    }

                    let dist = get_square_dist_between_points(
                        ray.start,
                        position
                    );
                    let normal = target.get_normals_at(position);
                    let observation = new Collision(
                        position,
                        [normal],
                        target
                    );
                    if (nearest_dist == null || dist < nearest_dist) {
                        nearest_observation = observation;
                        nearest_dist = dist;
                    }
                }
            }

            observations.push(nearest_observation);
        }

        return observations;
    }

    step(direction) {
        let base_move_direction = [
            Math.cos(this.orientation + direction),
            -Math.sin(this.orientation + direction),
        ];
        let start_position = this.position;
        let total_step_length = (this.move_speed * WORLD.dt) / 1000.0;
        let max_step_length = total_step_length;

        // Try the max possible step first
        let step = scale(base_move_direction, max_step_length);
        this.position = add(this.position, step);
        let collisions = collide_object_with_world(this);
        if (collisions.length <= 1) {
            return;
        }

        // If max step produces more than 1 collision,
        // try to binary search for the best straight step
        let min_step_length = 0.0;
        let best_step_length = 0.0;
        while (max_step_length - min_step_length > WORLD.eps) {
            let curr_step_length =
                min_step_length +
                (max_step_length - min_step_length) / 2.0;
            let step = scale(base_move_direction, curr_step_length);
            this.position = add(this.position, step);
            let curr_collisions = collide_object_with_world(this);
            if (curr_collisions.length <= 1) {
                best_step_length = curr_step_length;
                min_step_length = curr_step_length;
                collisions = curr_collisions;
            } else {
                max_step_length = curr_step_length;
            }

            this.position = start_position;
        }

        // Apply the best straight step
        this.position = add(
            start_position,
            scale(base_move_direction, best_step_length)
        );
        start_position = this.position;
        if (collisions.length <= 1) {
            return;
        }

        // Utilize the step remainder along the collision tangent
        // First, try to slide along the average collisions tangent
        let step_length = total_step_length - best_step_length;
        let normals = collisions.map((c) => c.normals).flat(1);
        let tangents = normals.map((n) => get_tangent(n));
        let average_tangent = normalize(
            tangents.reduce((acc, curr) => add(acc, curr), [0.0, 0.0])
        );

        step = scale(
            average_tangent,
            step_length * dot(base_move_direction, average_tangent)
        );
        start_position = this.position;
        this.position = add(this.position, step);
        collisions = collide_object_with_world(this);
        if (collisions.length <= 1) {
            return;
        }

        // If we can't slide along the average tangent, let's try to slide
        // along any of the tangents
        best_step_length = 0.0;
        let best_step = [0.0, 0.0];
        for (let tangent of tangents) {
            let step = scale(
                tangent,
                step_length * dot(base_move_direction, tangent)
            );
            this.position = add(start_position, step);
            collisions = collide_object_with_world(this);
            if (collisions.length <= 1 && step_length > best_step_length) {
                best_step_length = step_length;
                best_step = step;
            }
        }

        this.position = add(start_position, best_step);
    }

    shoot() {
        let shoot_period = 1000.0 / this.shoot_speed;
        if (WORLD.time - this.last_time_shoot < shoot_period) {
            return;
        }

        this.last_time_shoot = WORLD.time;
        let view_direction = this.get_view_direction();
        let velocity = scale(view_direction, this.bullet_speed);
        let start_position = this.position;
        spawn_bullet(new Bullet(start_position, velocity, this));
    }

    look_at(target) {
        let target_view_dir = normalize(sub(target, this.position));
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

    get_normals_at(position) {
        return get_circle_normals_at(
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
    FORWARD_RIGHT: -0.25 * Math.PI,
    FORWARD_LEFT: 0.25 * Math.PI,
    BACK_RIGHT: -0.75 * Math.PI,
    BACK_LEFT: 0.75 * Math.PI,
};

export const ROTATION_DIRECTION = {
    LEFT: 1.0,
    RIGHT: -1.0,
};
