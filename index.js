import { Line, Triangle, Rectangle, Circle } from "./primitives.js";
import { Guy } from "./guy.js";
import { draw_circle } from "./draw.js";

const CANVAS = document.createElement("canvas");
const CONTEXT = CANVAS.getContext("2d");
CANVAS.width = 800;
CANVAS.height = 600;

document.body.appendChild(CANVAS);

function main() {
    let player = new Guy([10, 10]);
    let obstacles = [
        new Rectangle([15, 14], 4, 2),
        new Circle([15, 10], 2),
        new Triangle([20, 1], [17, 2], [19, 10]),
    ];

    player.draw(CONTEXT, "orange");
    for (let obstacle of obstacles) {
        obstacle.draw(CONTEXT, "gray");
    }

    let points = player.observe(obstacles);
    for (let p of points) {
        if (p != null) {
            draw_circle(p, 0.1, CONTEXT, "red");
        }
    }
}

main();
