const CANVAS = document.createElement("canvas");
const CONTEXT = CANVAS.getContext("2d");
CANVAS.width = 800;
CANVAS.height = 600;

document.body.appendChild(CANVAS);

const WORLD = {
    pixels_in_meter: 20,
};

class Guy {
    constructor(position) {
        this.size = 2.0;
        this.move_speed = 2.0;
        this.rotation_speed = 0.5 * Math.PI;
        this.view_angle = 0.5 * Math.PI;
        this.view_dist = 10.0;
        this.n_view_rays = 10;

        this.position = position;
        this.orientation = 0.0; // Angle in radians
    }
}

class Line {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
}

class Rectangle {
    constructor(position, width, height) {
        this.position = position;
        this.width = width;
        this.height = height;
    }
}

class Circle {
    constructor(position, radius) {
        this.position = position;
        this.radius = radius;
    }
}

function num_to_world(x) {
    return x * WORLD.pixels_in_meter;
}

function vec2_to_world(v) {
    return [num_to_world(v[0]), num_to_world(v[1])];
}

function rotate(point, center, angle) {
    point = [point[0] - center[0], point[1] - center[1]];
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);

    let x = point[0] * cos - point[1] * sin + center[0];
    let y = point[1] * cos + point[0] * sin + center[1];

    return [x, y];
}

function get_square_dist_between_points(p0, p1) {
    let xd = p1[0] - p0[0];
    let yd = p1[1] - p0[1];
    let d2 = xd * xd + yd * yd;
    return d2;
}

function get_nearest_point(target, candidates) {
    let min_dist = null;
    let min_p = null;
    for (let p of candidates) {
        if (p == null) {
            continue;
        }

        let dist = get_square_dist_between_points(p, target);
        if (min_dist == null || dist < min_dist) {
            min_dist = dist;
            min_p = p;
        }
    }

    return min_p;
}

function get_guy_circle(guy) {
    return new Circle(guy.position, guy.size / 2.0);
}

function get_guy_view_rays(guy) {
    let rays = [];
    let start_ray = [guy.position[0] + guy.view_dist, guy.position[1]];
    let step = guy.view_angle / (guy.n_view_rays - 1);

    for (let i = 0; i < guy.n_view_rays; ++i) {
        let ray = rotate(
            start_ray,
            guy.position,
            -guy.orientation - 0.5 * guy.view_angle + i * step
        );
        rays.push(new Line([guy.position[0], guy.position[1]], ray));
    }

    return rays;
}

function draw_line(line, context, color) {
    let start = vec2_to_world(line.start);
    let end = vec2_to_world(line.end);

    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(start[0], start[1]);
    context.lineTo(end[0], end[1]);
    context.stroke();
}

function draw_rect(rect, context, color) {
    let position = vec2_to_world(rect.position);
    let width = num_to_world(rect.width);
    let height = num_to_world(rect.height);

    context.fillStyle = color;
    context.fillRect(position[0], position[1], width, height);
}

function draw_circle(circle, context, color) {
    let radius = num_to_world(circle.radius);
    let position = vec2_to_world(circle.position);

    context.fillStyle = color;
    context.beginPath();
    context.arc(position[0], position[1], radius, 0, 2 * Math.PI);
    context.fill();
}

function draw_guy(guy, context, color) {
    let rays = get_guy_view_rays(guy);
    for (let ray of rays) {
        draw_line(ray, context, "rgb(60,60,60)");
    }

    let circle = get_guy_circle(guy);
    draw_circle(circle, context, color);
}

function intersect_lines(line0, line1) {
    let a = line0.start[0];
    let b = line0.end[0];
    let e = line0.start[1];
    let f = line0.end[1];
    let c = line1.start[0];
    let d = line1.end[0];
    let h = line1.start[1];
    let g = line1.end[1];

    let ba = b - a;
    let dc = d - c;
    let fe = f - e;
    let gh = g - h;

    let t = ((h - e) * dc + gh * a - gh * c) / (fe * dc - gh * ba);
    let x = a + t * (b - a);
    let y = e + t * (f - e);

    if (
        x >= Math.min(a, b) &&
        x >= Math.min(c, d) &&
        x <= Math.max(a, b) &&
        x <= Math.max(c, d) &&
        y >= Math.min(e, f) &&
        y >= Math.min(h, g) &&
        y <= Math.max(e, f) &&
        y <= Math.max(h, g)
    ) {
        return [x, y];
    } else {
        return null;
    }
}

function intersect_line_rect(line, rect) {
    let a = rect.position;
    let b = [a[0] + rect.width, a[1]];
    let c = [b[0], a[1] + rect.height];
    let d = [a[0], c[1]];

    let intersections = [
        intersect_lines(line, new Line(a, b)),
        intersect_lines(line, new Line(b, c)),
        intersect_lines(line, new Line(c, d)),
        intersect_lines(line, new Line(d, a)),
    ];

    return get_nearest_point(line.start, intersections);
}

function intersect_line_circle(line, circle) {
    let cx = circle.position[0];
    let cy = circle.position[1];
    let r = circle.radius;

    let x0;
    let x1;
    let y0;
    let y1;
    if (line.end[0] == line.start[0]) {
        let x = line.end[0];
        let root = Math.sqrt(r * r - x * x + 2 * cx * x - cx * cx);

        x0 = x;
        x1 = x;
        y0 = cy + root;
        y1 = cy - root;
    } else {
        let a =
            (line.end[1] - line.start[1]) / (line.end[0] - line.start[0]);
        let b = line.start[1] - a * line.start[0];
        let root = Math.sqrt(
            r * r +
                a * a * r * r +
                2 * a * cx * cy +
                2 * b * cy -
                a * a * cx * cx -
                2 * a * b * cx -
                b * b -
                cy * cy
        );

        x0 = (cx - a * b + a * cy + root) / (1 + a * a);
        x1 = (cx - a * b + a * cy - root) / (1 + a * a);
        y0 = a * x0 + b;
        y1 = a * x1 + b;
    }

    let intersections = [
        [x0, y0],
        [x1, y1],
    ];
    return get_nearest_point(line.start, intersections);
}

function main() {
    let player = new Guy([10, 10]);
    let obstacle_rect = new Rectangle([15, 14], 4, 2);
    let obstacle_circ = new Circle([15, 10], 2);
    draw_guy(player, CONTEXT, "orange");
    draw_rect(obstacle_rect, CONTEXT, "gray");
    draw_circle(obstacle_circ, CONTEXT, "gray");

    let view_rays = get_guy_view_rays(player);
    for (let r of view_rays) {
        let p = intersect_line_rect(r, obstacle_rect);
        if (p != null) {
            draw_circle(new Circle(p, 0.1), CONTEXT, "red");
        }

        p = intersect_line_circle(r, obstacle_circ);
        if (p != null) {
            draw_circle(new Circle(p, 0.1), CONTEXT, "red");
        }
    }
}

main();
