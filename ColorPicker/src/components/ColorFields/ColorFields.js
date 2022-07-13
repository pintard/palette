import { createElement as make } from '../../utils/utils.js'
import { RGBtoHEX, HEXtoRGB } from '../../utils/conversions.js'
import { tag, eventType } from '../../constants/enums.js'
import {
    B_FLD_ID, G_FLD_ID, HEXVW_ID, HEX_FLDS_CNAME, HXFLD_ID, RGBVW_ID, RGB_FLDS_CNAME, R_FLD_ID
} from '../../constants/attributes.js'

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

    setValue = value => {
        this.color[this.index] = value
        this.value = value
        this.element.value = value
    }

    getValue = () => this.value

    setElement = element => this.element = element

    getElement = () => this.element

    format = () => {
        const isNumber = e => e.target.value.length <= 2 && (e.keyCode >= 48 && e.keyCode <= 57)

        const click = e => (e.target.value === '0') ? e.target.value = '' : 0

        const blur = e => (e.target.value === '') ? e.target.value = 0 : 0

        const field = make(tag.INPUT, RGBVW_ID, [
            { id: this.id },
            { className: RGB_FLDS_CNAME },
            { value: this.value },
            { onkeypress: e => isNumber(e) },
            { onkeyup: e => this.dispatch(e) },
            { onclick: e => click(e) },
            { onblur: e => blur(e) }
        ])

        this.setElement(field)
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
                target: this.element
            }
        }))
    }
}

/**
 * HEX Field Class
 * for interpreting hex values, and dispatching color state changes
 */
export class HEXField {
    constructor(color) {
        this.color = color
        this.format()
        this.initialize()
    }

    setColor = color => {
        this.color = color
        this.element.value = RGBtoHEX(...this.color)
    }

    getColor = () => this.color

    setElement = element => this.element = element

    getElement = () => this.element

    format = () => {
        const isHEX = e => e.target.value.length <= 5 && /[0-9A-F]/i.test(String.fromCharCode(e.keyCode))

        const field = make(tag.INPUT, HEXVW_ID, [
            { id: HXFLD_ID },
            { className: HEX_FLDS_CNAME },
            { value: RGBtoHEX(...this.color) },
            { onkeypress: e => isHEX(e) },
            { onkeyup: e => this.dispatch(e) }
        ])

        this.setElement(field)
    }

    initialize = () => document.addEventListener('colorchange', ({ detail: d }) =>
        [eventType.SLIDER, eventType.PANEL, eventType.RGB].some(e => d.type === e) &&
        this.setColor(d.color))

    dispatch = e => {
        const temp = this.color
        let index = -1

        setTimeout(() => {
            try {
                this.setColor(HEXtoRGB(e.target.value))
                index = temp.findIndex((val, i) => val !== this.color[i])
            } catch (error) { console.warn('ERROR: Incomplete Hex') }

            document.dispatchEvent(new CustomEvent('colorchange', {
                detail: {
                    color: this.color,
                    changing: index,
                    type: eventType.HEX,
                    target: this.element
                }
            }))
        }, 100)
    }
}