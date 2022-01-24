export const quadratic = (a: number, b: number, c: number): number[] => {
    const roots = [(-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a), (-b - Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a)];

    return roots.filter((r) => !isNaN(r));
};

export const roundForFloatingPoint = (num: number): number => Math.round(num * 1000) / 1000;

// does the line segment A have overlap with line segment B
export const hasOverlap = (a0: number, a1: number, b0: number, b1: number): boolean => {
    if (b1 < a0) return false;
    if (a1 < b0) return false;
    return true;
};

export const getExactOverlap = (a0: number, a1: number, b0: number, b1: number): number | null => {
    if (a0 === b1) return a0;
    if (a1 === b0) return a1;
    return null;
};
