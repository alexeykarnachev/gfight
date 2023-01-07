import { num_to_world, vec2_to_world, WORLD } from "./world.js";

export function draw_line(start, end, width, color) {
    start = vec2_to_world(start);
    end = vec2_to_world(end);

    WORLD.context.lineWidth = width;
    WORLD.context.strokeStyle = color;
    WORLD.context.beginPath();
    WORLD.context.moveTo(start[0], start[1]);
    WORLD.context.lineTo(end[0], end[1]);
    WORLD.context.stroke();
}

export function draw_triangle(a, b, c, color) {
    a = vec2_to_world(a);
    b = vec2_to_world(b);
    c = vec2_to_world(c);

    WORLD.context.fillStyle = color;
    WORLD.context.beginPath();
    WORLD.context.moveTo(a[0], a[1]);
    WORLD.context.lineTo(b[0], b[1]);
    WORLD.context.lineTo(c[0], c[1]);
    WORLD.context.fill();
}

export function draw_rectangle(position, width, height, color) {
    position = vec2_to_world(position);
    width = num_to_world(width);
    height = num_to_world(height);

    WORLD.context.fillStyle = color;
    WORLD.context.fillRect(position[0], position[1], width, height);
}

export function draw_circle(position, radius, color) {
    position = vec2_to_world(position);
    radius = num_to_world(radius);

    WORLD.context.fillStyle = color;
    WORLD.context.beginPath();
    WORLD.context.arc(position[0], position[1], radius, 0, 2 * Math.PI);
    WORLD.context.fill();
}
