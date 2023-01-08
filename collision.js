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
    constructor(tag, position, normals) {
        this.tag = tag;
        this.position = position;
        this.normals = normals;
    }
}

export function collide_object_with_world(object) {
    let primitive = object.get_primitive();

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
        for (let target of group.objects) {
            if (target[collision_fn] != null && target !== object) {
                for (let position of target[collision_fn](primitive)) {
                    let normals = target.get_normals_at(position);
                    collisions.push(
                        new Collision(group.tag, position, normals)
                    );
                }
            }
        }
    }

    return collisions;
}
