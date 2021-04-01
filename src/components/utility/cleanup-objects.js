export const cleanEmpty = (obj) => {
    Object.entries(obj)
        .map(([k, v]) => [k, v && typeof v === "object" ? cleanEmpty(v) : v])
        .reduce((a, [k, v]) => ((v == null || v==='' || v===0 || v===-1 || v==undefined) ? a : ((a[k] = v), a)), {});
}
