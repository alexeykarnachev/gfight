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

export const GUY_TAG = {
    PLAYER: 0,
    DUMMY_AI: 1,
};

export let GUY_COLORS = {};
GUY_COLORS[GUY_TAG.PLAYER] = {
    circle: "orange",
    health_bar: "green",
    view_rays: "gray",
};
GUY_COLORS[GUY_TAG.DUMMY_AI] = {
    circle: "crimson",
    health_bar: "red",
    view_rays: null,
};