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

export const STEP_DIRECTION_NAMES = Object.keys(STEP_DIRECTION);

export const GUY_TAG = {
    PLAYER: 1,
    TOWER_AI: 2,
    NEURAL_AI: 3,
};

export let GUY_COLORS = {};
GUY_COLORS[GUY_TAG.PLAYER] = {
    circle: "orange",
    health_bar: "green",
    view_rays: "orange",
};
GUY_COLORS[GUY_TAG.TOWER_AI] = {
    circle: "crimson",
    health_bar: "red",
    view_rays: "crimson",
};
GUY_COLORS[GUY_TAG.NEURAL_AI] = GUY_COLORS[GUY_TAG.TOWER_AI];
