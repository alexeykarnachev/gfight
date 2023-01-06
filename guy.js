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
} from "./geometry.js";
import { COLLISION_TAG, Collision } from "./collision.js";

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

    observe(obstacles, guys) {
        let view_rays = this.get_view_rays();
        let observations = [];

        let groups = [
            { objects: obstacles, tag: COLLISION_TAG.OBSTACLE_OBSERVE },
            { objects: guys, tag: COLLISION_TAG.GUY_OBSERVE },
        ];

        for (let ray of view_rays) {
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

        return observations;
    }

    collide(obstacles, guys) {
        let groups = [
            { objects: obstacles, tag: COLLISION_TAG.OBSTACLE_COLLIDE },
            { objects: guys, tag: COLLISION_TAG.GUY_COLLIDE },
        ];

        let collisions = [];
        for (let group of groups) {
            for (let object of group.objects) {
                if (object.collide_with_circle != null) {
                    let positions = object.collide_with_circle(
                        this.get_circle()
                    );
                    if (positions.length > 0) {
                        collisions.push(
                            new Collision(group.tag, positions)
                        );
                    }
                }
            }
        }

        return collisions;
    }

    look_at(target, dt) {
        let target_view_dir = normalize([
            target[0] - this.position[0],
            target[1] - this.position[1],
        ]);

        let target_orientation = -Math.atan2(
            target_view_dir[1],
            target_view_dir[0]
        );
        let step = (this.rotation_speed * dt) / 1000.0;

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

    move(dir, dt) {
        dir = normalize(dir);
        let step = (this.move_speed * dt) / 1000.0;
        this.position[0] += dir[0] * step;
        this.position[1] += dir[1] * step;
    }
}
