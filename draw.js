import { num_to_world, vec2_to_world } from "./world.js";

export function draw_line(start, end, context, color) {
    start = vec2_to_world(start);
    end = vec2_to_world(end);

    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(start[0], start[1]);
    context.lineTo(end[0], end[1]);
    context.stroke();
}

export function draw_triangle(a, b, c, context, color) {
    a = vec2_to_world(a);
    b = vec2_to_world(b);
    c = vec2_to_world(c);

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(a[0], a[1]);
    context.lineTo(b[0], b[1]);
    context.lineTo(c[0], c[1]);
    context.fill();
}

export function draw_rectangle(position, width, height, context, color) {
    position = vec2_to_world(position);
    width = num_to_world(width);
    height = num_to_world(height);

    context.fillStyle = color;
    context.fillRect(position[0], position[1], width, height);
}

export function draw_circle(position, radius, context, color) {
    position = vec2_to_world(position);
    radius = num_to_world(radius);

    context.fillStyle = color;
    context.beginPath();
    context.arc(position[0], position[1], radius, 0, 2 * Math.PI);
    context.fill();
}
