export function argmax(arr) {
    return arr.reduce((max_idx, curr_val, curr_idx, vals) => {
        return curr_val > vals[max_idx] ? curr_idx : max_idx;
    }, 0);
}

export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
