export const OBSERVATION_TAG = {
    NONE: 0,
    OBSTACLE: 1,
    GUY: 2,
};

export class Observation {
    constructor(tag, position) {
        this.tag = tag;
        this.position = position;
    }
}
