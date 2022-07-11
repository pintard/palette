import { createElement } from '../../utils/utils.js'
import { RGBtoHEX, HEXtoRGB } from '../../utils/conversions.js'
import { tag, eventType } from '../../constants/enums.js'
import {
    B_FLD_ID, G_FLD_ID, HEXVW_ID, HEX_FLDS_CNAME,
    RGBVW_ID, RGB_FLDS_CNAME, R_FLD_ID
} from '/ColorPicker/src/constants/general_configs.js'

const indexMap = Object.freeze({ [R_FLD_ID]: 0, [G_FLD_ID]: 1, [B_FLD_ID]: 2 })

/**
 * RGB Field Class
 * for interpreting r, g, b values, and dispatching color state changes
 */
export class RGBField {
    constructor(id, color) {
        this.id = id
        this.color = color
        this.index = indexMap[id]
        this.value = color[this.index]
        this.format()
        this.initialize()
    }

    getValue = () => this.value

    setValue = value => {
        this.color[this.index] = value
        this.value = value
        this.field.value = value
    }

    format = () => {
        const isNumber = e => e.target.value.length <= 2 && (e.keyCode >= 48 && e.keyCode <= 57)

        const click = e => (e.target.value === '0') ? e.target.value = '' : 0

        const blur = e => (e.target.value === '') ? e.target.value = 0 : 0

        const field = createElement(tag.INPUT, RGBVW_ID, [
            { id: this.id },
            { className: RGB_FLDS_CNAME },
            { value: this.value },
            { onkeypress: e => isNumber(e) },
            { onkeyup: e => this.dispatch(e) },
            { onclick: e => click(e) },
            { onblur: e => blur(e) }
        ])

        this.field = field
    }

    initialize = () => document.addEventListener('colorchange', ({ detail: d }) =>
        [eventType.SLIDER, eventType.PANEL, eventType.HEX].some(e => d.type === e) &&
        this.setValue(d.color[this.index]))

    dispatch = e => {
        this.setValue(Number(e.target.value))

        document.dispatchEvent(new CustomEvent('colorchange', {
            detail: {
                color: this.color,
                changing: this.index,
                type: eventType.RGB,
                target: document.getElementById(this.id)
            }
        }))
    }
}

/**
 * HEX Field Class
 * for interpreting hex values, and dispatching color state changes
 */
export class HEXField {
    constructor(id, color) {
        this.id = id
        this.color = color
        this.format()
        this.initialize()
    }

    getColor = () => this.color

    setColor = color => {
        this.color = color
        this.field.value = RGBtoHEX(...this.color)
    }

    format = () => {
        const isHEX = e => e.target.value.length <= 5 && /[0-9A-F]/i.test(String.fromCharCode(e.keyCode))

        const field = createElement(tag.INPUT, HEXVW_ID, [
            { id: this.id },
            { className: HEX_FLDS_CNAME },
            { value: RGBtoHEX(...this.color) },
            { onkeypress: e => isHEX(e) },
            { onkeyup: e => this.dispatch(e) }
        ])

        this.field = field
    }

    initialize = () => document.addEventListener('colorchange', ({ detail: d }) =>
        [eventType.SLIDER, eventType.PANEL, eventType.RGB].some(e => d.type === e) &&
        this.setColor(d.color))

    dispatch = e => {
        const temp = this.color

        setTimeout(() => {
            try { this.setColor(HEXtoRGB(e.target.value)) }
            catch (error) { console.warn('ERROR: Incomplete Hex') }

            document.dispatchEvent(new CustomEvent('colorchange', {
                detail: {
                    color: this.color,
                    changing: temp.findIndex((val, i) => val !== this.color[i]),
                    type: eventType.HEX,
                    target: document.getElementById(this.id)
                }
            }))
        }, 100)
    }
}