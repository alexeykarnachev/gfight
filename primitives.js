import {
    intersect_lines,
    intersect_circles,
    intersect_line_with_triangle,
    intersect_line_with_rectangle,
    intersect_line_with_circle,
} from "./geometry.js";
import {
    draw_line,
    draw_triangle,
    draw_rectangle,
    draw_circle,
} from "./draw.js";

export class Line {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    draw(context, color) {
        draw_line(this.start, this.end, context, color);
    }

    collide_with_line(line) {
        let intersections = intersect_lines(
            this.start,
            this.end,
            line.start,
            line.end
        );
        return intersections;
    }

    collide_with_triangle(triangle) {
        let intersections = intersect_line_with_triangle(
            this.start,
            this.end,
            triangle.a,
            triangle.b,
            triangle.c
        );
        return intersections;
    }

    collide_with_rectangle(rectangle) {
        let intersections = intersect_line_with_rectangle(
            this.start,
            this.end,
            rectangle.position,
            rectangle.width,
            rectangle.height
        );
        return intersections;
    }

    collide_with_circle(circle) {
        let intersections = intersect_line_with_circle(
            this.start,
            this.end,
            circle.position,
            circle.radius
        );
        return intersections;
    }
}

export class Triangle {
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }

    draw(context, color) {
        draw_triangle(this.a, this.b, this.c, context, color);
    }

    collide_with_line(line) {
        return line.collide_with_triangle(this);
    }
}

export class Rectangle {
    constructor(position, width, height) {
        this.position = position;
        this.width = width;
        this.height = height;
    }

    draw(context, color) {
        draw_rectangle(
            this.position,
            this.width,
            this.height,
            context,
            color
        );
    }

    collide_with_line(line) {
        return line.collide_with_rectangle(this);
    }
}

export class Circle {
    constructor(position, radius) {
        this.position = position;
        this.radius = radius;
    }

    draw(context, color) {
        draw_circle(this.position, this.radius, context, color);
    }

    collide_with_line(line) {
        return line.collide_with_circle(this);
    }

    collide_with_circle(circle) {
        return intersect_circles(
            this.position,
            this.radius,
            circle.position,
            circle.radius
        );
    }
}
