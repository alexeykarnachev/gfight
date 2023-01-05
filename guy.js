import { draw_line, draw_circle } from "./draw.js";
import { Line } from "./primitives.js";
import {
    rotate,
    get_nearest_point,
    normalize,
    dot,
    get_radians_diff,
    intersect_line_with_circle,
    get_square_dist_between_points,
} from "./geometry.js";
import { OBSERVATION_TAG, Observation } from "./observation.js";

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

    collide_with_line(line) {
        return intersect_line_with_circle(
            line.start,
            line.end,
            this.position,
            this.size / 2.0
        );
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

    observe(obstacles, guys) {
        let view_rays = this.get_view_rays();
        let observations = [];

        let groups = [
            { objects: obstacles, tag: OBSERVATION_TAG.OBSTACLE },
            { objects: guys, tag: OBSERVATION_TAG.GUY },
        ];

        for (let ray of view_rays) {
            let nearest_observation = null;
            let nearest_dist = null;

            for (let group of groups) {
                for (let object of group.objects) {
                    let position = object.collide_with_line(ray);
                    if (position == null) {
                        continue;
                    }
                    let dist = get_square_dist_between_points(
                        ray.start,
                        position
                    );
                    let observation = new Observation(group.tag, position);
                    if (nearest_dist == null || dist < nearest_dist) {
                        nearest_observation = observation;
                        nearest_dist = dist;
                    }
                }
            }

            if (nearest_observation != null) {
                observations.push(nearest_observation);
            } else {
                observations.push(
                    new Observation(OBSERVATION_TAG.NONE, null)
                );
            }
        }

        return observations;
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
        console.log(this.position);
    }
}
