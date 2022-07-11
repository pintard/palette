export const RGBtoHEX = (r, g, b) => ((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16).slice(1).toUpperCase()

export const HEXtoRGB = hex => /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
    .exec(hex).slice(1, 4).map(val => parseInt(val, 16))

export const RGBtoHSL = (r, g, b) => {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b), diff = max - min
    let h = (diff === 0) ? 0 : NaN, l = (min + max) / 2,
        s = (diff === 0) ? 0 : (diff / (1 - Math.abs(2 * l - 1)))
    if (diff !== 0) switch (max) {
        case r: h = (g - b) / diff % 6; break
        case g: h = (b - r) / diff + 2; break
        case b: h = (r - g) / diff + 4
    }
    return [h < 0 ? h + 360 : h, s, l].map((val, i) => (i === 0) ? Math.round(val * 60) : Number(val.toFixed(2)))
}

export const HSLtoRGB = (h, s, l) => {
    const rad = h / 60.0,
        a = (1 - Math.abs(2 * l - 1)) * s,
        x = a * (1 - Math.abs((rad % 2) - 1)),
        m = l - a * 0.5
    let color
    switch (true) {
        case rad <= 1: color = [a, x, 0]; break
        case rad <= 2: color = [x, a, 0]; break
        case rad <= 3: color = [0, a, x]; break
        case rad <= 4: color = [0, x, a]; break
        case rad <= 5: color = [x, 0, a]; break
        case rad <= 6: color = [a, 0, x]; break
        default: color = [0, 0, 0]
    }
    return color.map(val => Math.round(255 * (val + m)))
}

export const HSVtoRGB = (h, s, v) => {
    h /= 360
    const i = Math.floor(h * 6),
        f = h * 6 - i,
        p = v * (1 - s),
        q = v * (1 - f * s),
        t = v * (1 - (1 - f) * s)
    let color
    switch (i % 6) {
        case 0: color = [v, t, p]; break
        case 1: color = [q, v, p]; break
        case 2: color = [p, v, t]; break
        case 3: color = [p, q, v]; break
        case 4: color = [t, p, v]; break
        case 5: color = [v, p, q]
    }
    return color.map(val => val * 255)
}

export const RGBtoHSV = (r, g, b) => {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b), diff = max - min
    let h, s = (max === 0 ? 0 : diff / max), v = max
    switch (max) {
        case min: h = 0; break
        case r: h = (g - b) / diff + (g < b ? 6 : 0); h /= 6; break
        case g: h = (b - r) / diff + 2; h /= 6; break
        case b: h = (r - g) / diff + 4; h /= 6
    }
    return [h * 360, s, v]
}