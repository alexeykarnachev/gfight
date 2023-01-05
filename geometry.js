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

export function intersect_line_with_triangle(start, end, a, b, c) {
    let intersections = [
        intersect_lines(start, end, a, b),
        intersect_lines(start, end, b, c),
        intersect_lines(start, end, c, a),
    ];

    return get_nearest_point(start, intersections);
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
        intersect_lines(start, end, c, d),
        intersect_lines(start, end, d, a),
    ];

    return get_nearest_point(start, intersections);
}

export function intersect_line_with_circle(start, end, position, radius) {
    let cx = position[0];
    let cy = position[1];
    let r = radius;

    let x0;
    let x1;
    let y0;
    let y1;
    if (end[0] == start[0]) {
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
    if (!isNaN(x0) && !isNaN(y0)) {
        intersections.push([x0, y0]);
    }
    if (!isNaN(x1) && !isNaN(y1)) {
        intersections.push([x1, y1]);
    }
    return get_nearest_point(start, intersections);
}

export function get_square_dist_between_points(p0, p1) {
    let xd = p1[0] - p0[0];
    let yd = p1[1] - p0[1];
    let d2 = xd * xd + yd * yd;
    return d2;
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

export function rotate(point, center, angle) {
    point = [point[0] - center[0], point[1] - center[1]];
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);

    let x = point[0] * cos - point[1] * sin + center[0];
    let y = point[1] * cos + point[0] * sin + center[1];

    return [x, y];
}

export function normalize(v) {
    let length = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    return [v[0] / length, v[1] / length];
}

export function dot(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1];
}

export function get_radians_diff(a0, a1) {
    let diff = Math.abs(a0 - a1);
    diff = Math.min(diff, Math.abs(diff - 2 * Math.PI));
    return diff;
}
