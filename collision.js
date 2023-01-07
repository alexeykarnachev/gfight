import { Line, Triangle, Rectangle, Circle } from "./primitives.js";
import { WORLD } from "./world.js";
import {
    get_nearest_point,
    get_square_dist_between_points,
} from "./geometry.js";

export const COLLISION_TAG = {
    NONE: 0,

    OBSTACLE_COLLIDE: 1,
    GUY_COLLIDE: 2,

    OBSTACLE_OBSERVE: 3,
    GUY_OBSERVE: 4,
};

export class Collision {
    constructor(tag, positions, normals) {
        this.tag = tag;
        this.positions = positions;
        this.normals = normals;
    }
}

export function observe_world(view_rays) {
    let observations = [];

    let groups = [
        { objects: WORLD.obstacles, tag: COLLISION_TAG.OBSTACLE_OBSERVE },
        { objects: WORLD.guys, tag: COLLISION_TAG.GUY_OBSERVE },
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

export function collide_primitive_with_world(primitive) {
    let collision_fn;
    if (primitive instanceof Line) {
        collision_fn = "collide_with_line";
    } else if (primitive instanceof Triangle) {
        collision_fn = "collide_with_triangle";
    } else if (primitive instanceof Rectangle) {
        collision_fn = "collide_with_rectangle";
    } else if (primitive instanceof Circle) {
        collision_fn = "collide_with_circle";
    }

    let groups = [
        { objects: WORLD.obstacles, tag: COLLISION_TAG.OBSTACLE_COLLIDE },
        { objects: WORLD.guys, tag: COLLISION_TAG.GUY_COLLIDE },
    ];

    let collisions = [];
    for (let group of groups) {
        for (let object of group.objects) {
            if (object.collide_with_circle != null) {
                let positions = object[collision_fn](primitive);
                let normals = positions.map((p) =>
                    object.get_normal_at(p)
                );
                if (positions.length > 0) {
                    collisions.push(
                        new Collision(group.tag, positions, normals)
                    );
                }
            }
        }
    }

    return collisions;
}
