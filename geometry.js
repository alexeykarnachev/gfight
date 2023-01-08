import { WORLD } from "./world.js";

export function intersect_lines(start0, end0, start1, end1) {
    let a = start0[0];
    let b = end0[0];
    let e = start0[1];
    let f = end0[1];
    let c = start1[0];
    let d = end1[0];
    let h = start1[1];
    let g = end1[1];

    let ba = b - a;
    let dc = d - c;
    let fe = f - e;
    let gh = g - h;

    let t = ((h - e) * dc + gh * a - gh * c) / (fe * dc - gh * ba);
    let x = a + t * (b - a);
    let y = e + t * (f - e);

    if (
        x >= Math.min(a, b) - WORLD.eps &&
        x >= Math.min(c, d) - WORLD.eps &&
        x <= Math.max(a, b) + WORLD.eps &&
        x <= Math.max(c, d) + WORLD.eps &&
        y >= Math.min(e, f) - WORLD.eps &&
        y >= Math.min(h, g) - WORLD.eps &&
        y <= Math.max(e, f) + WORLD.eps &&
        y <= Math.max(h, g) + WORLD.eps
    ) {
        return [[x, y]];
    } else {
        return [];
    }
}

export function intersect_line_with_triangle(start, end, a, b, c) {
    let intersections = [
        intersect_lines(start, end, a, b),
        intersect_lines(start, end, b, c),
        intersect_lines(start, end, c, a),
    ].flat(1);

    return intersections;
}

export function intersect_line_with_rectangle(
    start,
    end,
    position,
    width,
    height
) {
    let a = position;
    let b = [a[0] + width, a[1]];
    let c = [b[0], a[1] + height];
    let d = [a[0], c[1]];

    let intersections = [
        intersect_lines(start, end, a, b),
        intersect_lines(start, end, b, c),
        intersect_lines(start, end, c, d, true),
        intersect_lines(start, end, d, a),
    ].flat(1);

    return intersections;
}

export function intersect_line_with_circle(start, end, position, radius) {
    let is_horizontal = Math.abs(start[1] - end[1]) < WORLD.eps;
    let is_vertical = Math.abs(start[0] - end[0]) < WORLD.eps;

    let cx = position[0];
    let cy = position[1];
    let r = radius;

    let x0;
    let x1;
    let y0;
    let y1;
    if (is_vertical) {
        let x = end[0];
        let root = Math.sqrt(r * r - x * x + 2 * cx * x - cx * cx);

        x0 = x;
        x1 = x;
        y0 = cy + root;
        y1 = cy - root;
    } else {
        let a = (end[1] - start[1]) / (end[0] - start[0]);
        let b = start[1] - a * start[0];
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

    let intersections = [];
    let kx0 = (x0 - start[0]) / (end[0] - start[0]);
    let kx1 = (x1 - start[0]) / (end[0] - start[0]);
    let ky0 = (y0 - start[1]) / (end[1] - start[1]);
    let ky1 = (y1 - start[1]) / (end[1] - start[1]);
    let kx0_is_valid = kx0 >= 0 && kx0 <= 1 && !isNaN(kx0);
    let kx1_is_valid = kx1 >= 0 && kx1 <= 1 && !isNaN(kx1);
    let ky0_is_valid = ky0 >= 0 && ky0 <= 1 && !isNaN(ky0);
    let ky1_is_valid = ky1 >= 0 && ky1 <= 1 && !isNaN(ky1);
    if (
        (is_horizontal && kx0_is_valid) ||
        (is_vertical && ky0_is_valid) ||
        (kx0_is_valid && ky0_is_valid)
    ) {
        intersections.push([x0, y0]);
    }

    if (
        (is_horizontal && kx1_is_valid) ||
        (is_vertical && ky1_is_valid) ||
        (kx1_is_valid && ky1_is_valid)
    ) {
        intersections.push([x1, y1]);
    }

    return intersections;
}

export function intersect_circles(position0, radius0, position1, radius1) {
    let r0 = radius0;
    let r1 = radius1;
    let rotated = false;

    if (Math.abs(position0[0] - position1[0]) < WORLD.eps) {
        rotated = true;
        position1 = rotate(position1, position0, -Math.PI * 0.5);
    }
    let x0 = position0[0];
    let y0 = position0[1];
    let x1 = position1[0];
    let y1 = position1[1];

    let A = x0 * x0 + y0 * y0 - r0 * r0 - x1 * x1 - y1 * y1 + r1 * r1;
    let B = 2 * x1 - 2 * x0;
    let C = 2 * y1 - 2 * y0;
    let D = -1 / B;
    let E = C * D;
    let F = A * D;
    let G = x0 * x0 + y0 * y0 - r0 * r0;

    let a = E * E + 1;
    let b = 2 * E * F - 2 * x0 * E - 2 * y0;
    let c = F * F - 2 * x0 * F + G;
    let d = b * b - 4 * a * c;

    let intersections = [];
    let root = Math.sqrt(d);
    if (!isNaN(root)) {
        let y_0 = (-b + root) / (2 * a);
        let y_1 = (-b - root) / (2 * a);
        let x_0 = (-y_0 * C - A) / B;
        let x_1 = (-y_1 * C - A) / B;
        intersections.push([x_0, y_0]);
        intersections.push([x_1, y_1]);
    }

    if (rotated) {
        intersections = intersections.map((p) =>
            rotate(p, position0, Math.PI * 0.5)
        );
    }

    return intersections;
}

export function intersect_triangle_with_circle(a, b, c, position, radius) {
    let intersections = [
        ...intersect_line_with_circle(a, b, position, radius),
        ...intersect_line_with_circle(b, c, position, radius),
        ...intersect_line_with_circle(c, a, position, radius),
    ];
    return intersections;
}

export function intersect_rectangle_with_circle(
    rectangle_position,
    width,
    height,
    circle_position,
    radius
) {
    let a = rectangle_position;
    let b = [a[0] + width, a[1]];
    let c = [b[0], a[1] + height];
    let d = [a[0], c[1]];

    let intersections = [
        ...intersect_line_with_circle(a, b, circle_position, radius),
        ...intersect_line_with_circle(b, c, circle_position, radius),
        ...intersect_line_with_circle(c, d, circle_position, radius),
        ...intersect_line_with_circle(d, a, circle_position, radius),
    ];
    return intersections;
}

export function get_square_dist_between_points(p0, p1) {
    let xd = p1[0] - p0[0];
    let yd = p1[1] - p0[1];
    let d2 = xd * xd + yd * yd;
    return d2;
}

export function get_dist_between_points(p0, p1) {
    let d = Math.sqrt(get_square_dist_between_points(p0, p1));
    return d;
}

export function get_nearest_point(target, candidates) {
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

export function get_line_normals_at(start, end, position) {
    let kx = (position[0] - start[0]) / (end[0] - start[0]);
    let ky = (position[1] - start[1]) / (end[1] - start[1]);
    let kx_is_good = kx <= 1.0 && kx >= 0.0;
    let ky_is_good = ky <= 1.0 && ky >= 0.0;
    if (
        Math.abs(end[0] - start[0]) < WORLD.eps &&
        Math.abs(position[0] - start[0]) < WORLD.eps &&
        ky_is_good
    ) {
        return start[1] < end[1] ? [[1, 0]] : [[-1, 0]];
    } else if (
        Math.abs(end[1] - start[1]) < WORLD.eps &&
        Math.abs(position[1] - start[1]) < WORLD.eps &&
        kx_is_good
    ) {
        return start[0] < end[0] ? [[0, -1]] : [[0, 1]];
    } else if (Math.abs(kx - ky) < WORLD.eps && kx_is_good && ky_is_good) {
        return [normalize([start[1] - end[1], end[0] - start[0]])];
    } else {
        return [];
    }
}

export function get_triangle_normals_at(a, b, c, position) {
    let normals = [];
    for (let line of [
        [a, b],
        [b, c],
        [c, a],
    ]) {
        let normals_ = get_line_normals_at(line[0], line[1], position);
        if (normals_.length > 0) {
            normals.push(...normals_);
        }
    }
    return normals;
}

export function get_rectangle_normals_at(
    rectangle_position,
    width,
    height,
    point_position
) {
    let a = rectangle_position;
    let b = [a[0] + width, a[1]];
    let c = [b[0], a[1] + height];
    let d = [a[0], c[1]];

    let normals = [];
    for (let line of [
        [a, b],
        [b, c],
        [c, d],
        [d, a],
    ]) {
        let normals_ = get_line_normals_at(
            line[0],
            line[1],
            point_position
        );
        if (normals_.length > 0) {
            normals.push(...normals_);
        }
    }
    return normals;
}

export function get_circle_normals_at(
    circle_position,
    radius,
    point_position
) {
    let x0 = circle_position[0];
    let y0 = circle_position[1];
    let x = point_position[0];
    let y = point_position[1];
    let r = radius;
    let err = Math.sqrt((x0 - x) * (x0 - x) + (y0 - y) * (y0 - y)) - r;
    err = Math.abs(err);
    if (err < WORLD.eps) {
        let vec = [point_position[0] - x0, point_position[1] - y0];
        return [normalize(vec)];
    } else {
        return [];
    }
}

export function rotate(point, center, angle) {
    point = [point[0] - center[0], point[1] - center[1]];
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);

    let x = point[0] * cos - point[1] * sin + center[0];
    let y = point[1] * cos + point[0] * sin + center[1];

    return [x, y];
}

export function rotate90(point, center, clockwise) {
    let vec = sub(point, center);
    return clockwise ? [-vec[1], vec[0]] : [vec[1], -vec[0]];
}

export function length(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

export function normalize(v) {
    let len = length(v);
    return [v[0] / len, v[1] / len];
}

export function dot(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1];
}

export function get_orientation(position, target) {
    let dir = normalize(sub(target, position));
    let orientation = -Math.atan2(dir[1], dir[0]);
    return orientation;
}

export function get_tangent(normal) {
    return [-normal[1], normal[0]];
}

export function get_radians_diff(a0, a1) {
    let diff = Math.abs(a0 - a1);
    diff = Math.min(diff, Math.abs(diff - 2 * Math.PI));
    return diff;
}

export function add(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1]];
}

export function sub(v1, v2) {
    return [v1[0] - v2[0], v1[1] - v2[1]];
}

export function scale(v, s) {
    return [v[0] * s, v[1] * s];
}
