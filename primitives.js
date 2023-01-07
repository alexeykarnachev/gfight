import {
    normalize,
    intersect_lines,
    intersect_circles,
    intersect_line_with_triangle,
    intersect_line_with_rectangle,
    intersect_line_with_circle,
    intersect_triangle_with_circle,
    intersect_rectangle_with_circle,
    get_line_normals_at,
    get_triangle_normals_at,
    get_rectangle_normals_at,
    get_circle_normals_at,
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

    draw(color, width) {
        draw_line(this.start, this.end, width, color);
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

    get_normals_at(position) {
        return get_line_normals_at(this.start, this.end, position);
    }
}

export class Triangle {
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }

    draw(color) {
        draw_triangle(this.a, this.b, this.c, color);
    }

    collide_with_line(line) {
        let intersections = intersect_line_with_triangle(
            line.start,
            line.end,
            this.a,
            this.b,
            this.c
        );
        return intersections;
    }

    collide_with_circle(circle) {
        let intersections = intersect_triangle_with_circle(
            this.a,
            this.b,
            this.c,
            circle.position,
            circle.radius
        );
        return intersections;
    }

    get_normals_at(position) {
        return get_triangle_normals_at(this.a, this.b, this.c, position);
    }
}

export class Rectangle {
    constructor(position, width, height) {
        this.position = position;
        this.width = width;
        this.height = height;
    }

    draw(color) {
        draw_rectangle(this.position, this.width, this.height, color);
    }

    collide_with_line(line) {
        let intersections = intersect_line_with_rectangle(
            line.start,
            line.end,
            this.position,
            this.width,
            this.height
        );
        return intersections;
    }

    collide_with_circle(circle) {
        let intersections = intersect_rectangle_with_circle(
            this.position,
            this.width,
            this.height,
            circle.position,
            circle.radius
        );
        return intersections;
    }

    get_normals_at(position) {
        return get_rectangle_normals_at(
            this.position,
            this.width,
            this.height,
            position
        );
    }
}

export class Circle {
    constructor(position, radius) {
        this.position = position;
        this.radius = radius;
    }

    draw(color) {
        draw_circle(this.position, this.radius, color);
    }

    collide_with_line(line) {
        let intersections = intersect_line_with_circle(
            line.start,
            line.end,
            this.position,
            this.radius
        );
        return intersections;
    }

    collide_width_triangle(triangle) {
        let intersections = intersect_triangle_with_circle(
            triangle.a,
            triangle.b,
            triangle.c,
            this.position,
            this.radius
        );
        return intersections;
    }

    collide_width_rectangle(rectangle) {
        let intersections = intersect_rectangle_with_circle(
            rectangle.position,
            rectangle.width,
            rectangle.height,
            this.position,
            this.radius
        );
        return intersections;
    }

    collide_with_circle(circle) {
        let intersections = intersect_circles(
            this.position,
            this.radius,
            circle.position,
            circle.radius
        );
        return intersections;
    }

    get_normals_at(position) {
        return get_circle_normals_at(this.position, this.radius, position);
    }
}
