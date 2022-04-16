export const numOrDefault = (num, requiredPositive) => {
    return num ? num : (requiredPositive ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
}