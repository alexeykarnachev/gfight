import { Line, Triangle, Rectangle, Circle } from "./primitives.js";
import { WORLD } from "./world.js";
import {
    get_nearest_point,
    get_square_dist_between_points,
} from "./geometry.js";

export class Collision {
    constructor(position, normals, target) {
        this.position = position;
        this.normals = normals;
        this.target = target;
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

    let groups = [WORLD.obstacles, WORLD.guys];

    let collisions = [];
    for (let group of groups) {
        for (let target of group) {
            if (target[collision_fn] != null && target !== object) {
                for (let position of target[collision_fn](primitive)) {
                    let normals = target.get_normals_at(position);
                    collisions.push(
                        new Collision(position, normals, target)
                    );
                }
            }
        }
    }

    return collisions;
}
