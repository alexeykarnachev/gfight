import { Line, Triangle, Rectangle, Circle } from "./primitives.js";
import { Guy } from "./guy.js";
import { draw_circle } from "./draw.js";
import { WORLD, vec2_to_local } from "./world.js";

const CANVAS = document.createElement("canvas");
const CONTEXT = CANVAS.getContext("2d");
CANVAS.width = WORLD.width;
CANVAS.height = WORLD.height;
document.body.appendChild(CANVAS);

CANVAS.addEventListener("mousemove", (event) => {
    let rect = CANVAS.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    WORLD.cursor_pos = [x, y];
});

function main_loop() {
    CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
    WORLD.player.draw(CONTEXT, "orange");
    for (let obstacle of WORLD.obstacles) {
        obstacle.draw(CONTEXT, "gray");
    }

    let points = WORLD.player.observe(WORLD.obstacles);
    for (let p of points) {
        if (p != null) {
            draw_circle(p, 0.1, CONTEXT, "red");
        }
    }

    if (WORLD.cursor_pos != null) {
        WORLD.player.look_at(vec2_to_local(WORLD.cursor_pos), WORLD.dt);
    }

    WORLD.update_time();
    requestAnimationFrame(main_loop);
}

function main() {
    WORLD.player = new Guy([10, 10]);
    WORLD.obstacles = [
        new Rectangle([15, 14], 4, 2),
        new Circle([15, 10], 2),
        new Triangle([20, 1], [17, 2], [19, 10]),
    ];

    requestAnimationFrame(main_loop);
}

main();
