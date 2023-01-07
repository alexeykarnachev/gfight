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
import {
    collide_primitive_with_world,
    COLLISION_TAG,
    Collision,
} from "./collision.js";
import { WORLD } from "./world.js";

export class Guy {
    constructor(position) {
        this.size = 2.0;
        this.move_speed = 2.0;
        this.rotation_speed = 8.0 * Math.PI;
        this.move_speed = 5.0;
        this.view_angle = Math.PI;
        this.view_dist = 20.0;
        this.n_view_rays = 21;

        this.position = position;
        this.orientation = 0.0; // Angle in radians
    }

    draw(color, view_rays_color) {
        if (view_rays_color != null) {
            let rays = this.get_view_rays();
            rays.map((r) =>
                draw_line(r.start, r.end, 1.0, view_rays_color)
            );
        }
        draw_circle(this.position, this.size / 2.0, color);
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

    observe_world() {
        let observations = [];

        let groups = [
            {
                objects: WORLD.obstacles,
                tag: COLLISION_TAG.OBSTACLE_OBSERVE,
            },
            { objects: WORLD.guys, tag: COLLISION_TAG.GUY_OBSERVE },
        ];

        for (let ray of this.get_view_rays()) {
            let nearest_observation = null;
            let nearest_dist = null;

            for (let group of groups) {
                for (let object of group.objects) {
                    let position = get_nearest_point(
                        ray.start,
                        object.collide_with_line(ray)
                    );
                    if (position == null) {
                        continue;
                    }
                    let dist = get_square_dist_between_points(
                        ray.start,
                        position
                    );
                    let observation = new Collision(group.tag, [position]);
                    if (nearest_dist == null || dist < nearest_dist) {
                        nearest_observation = observation;
                        nearest_dist = dist;
                    }
                }
            }

            if (nearest_observation != null) {
                observations.push(nearest_observation);
            } else {
                observations.push(new Collision(COLLISION_TAG.NONE, []));
            }
        }

        // for (let observation of observations) {
        //     draw_circle(observation.position, 0.1, "white");
        // }

        return observations;
    }

    step(direction) {
        let move_direction = [
            Math.cos(this.orientation + direction),
            -Math.sin(this.orientation + direction),
        ];
        let total_step_length = (this.move_speed * WORLD.dt) / 1000.0;
        let max_step_length = total_step_length;
        let min_step_length = 0.0;
        let best_step_length = 0.0;
        let collisions = [];

        // Binary search best straight step
        while (max_step_length - min_step_length > WORLD.eps) {
            let curr_step_length =
                min_step_length +
                (max_step_length - min_step_length) / 2.0;
            let step = scale(move_direction, curr_step_length);
            let new_position = add(this.position, step);
            collisions = collide_primitive_with_world(
                new Circle(new_position, this.size / 2.0)
            );
            if (collisions.length == 0) {
                best_step_length = curr_step_length;
                min_step_length = curr_step_length;
            } else if (collisions.length == 1) {
                best_step = curr_step_length;
                break;
            } else {
                max_step_length = curr_step_length;
            }
        }

        // Apply the best straight step
        this.position = add(
            this.position,
            scale(move_direction, best_step_length)
        );

        if (collisions.length == 0) {
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
        move_direction = scale(
            average_tangent,
            dot(move_direction, average_tangent)
        );

        let position = add(
            this.position,
            scale(move_direction, step_length)
        );
        collisions = collide_primitive_with_world(
            new Circle(position, this.size / 2.0)
        );
        if (collisions.length <= 1) {
            this.position = position;
            return;
        }

        // If we can't slide along the average tangent, let's try to slide
        // along the any tangent
        best_step_length = 0.0;
        let best_step = [0.0, 0.0];
        for (let i = 0; i < tangents.length; ++i) {
            move_direction = [
                Math.cos(this.orientation + direction),
                -Math.sin(this.orientation + direction),
            ];
            let tangent_proj = dot(move_direction, tangents[i]);
            let step = scale(tangents[i], step_length * tangent_proj);
            let position = add(this.position, step);

            collisions = collide_primitive_with_world(
                new Circle(position, this.size / 2.0)
            );
            if (collisions.length <= 1 && step_length > best_step_length) {
                best_step_length = step_length;
                best_step = step;
            }
        }

        this.position = add(this.position, best_step);
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
};

export const ROTATION_DIRECTION = {
    LEFT: 1.0,
    RIGHT: -1.0,
};
