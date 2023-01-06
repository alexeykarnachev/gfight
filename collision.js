export const COLLISION_TAG = {
    NONE: 0,

    OBSTACLE_COLLIDE: 1,
    GUY_COLLIDE: 2,

    OBSTACLE_OBSERVE: 3,
    GUY_OBSERVE: 4,
};

export class Collision {
    constructor(tag, positions) {
        this.tag = tag;
        this.positions = positions;
    }
}
