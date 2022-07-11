import {
    createElement as make, setElementStyles as update, setElementProps as modify,
    rgbToHexStr, rgbToStr
} from '../../utils/utils.js'
import { RGBtoHSV } from '../../utils/conversions.js'
import { color, tag } from '../../constants/enums.js'
import { LABEL_ID } from '../../constants/general_configs.js'

const { BLACK, WHITE } = color

export default class ColorLabel {
    constructor(parent, color) {
        this.parent = parent
        this.color = color
        this.format()
        this.initialize()
    }

    getColor = () => this.color

    setColor = color => {
        this.color = color
        this.updateLabel(color)
    }

    format = () => {
        this.container = make(tag.SPAN, this.parent,
            [{ id: LABEL_ID },
            { onclick: () => navigator.clipboard.writeText(rgbToHexStr(this.color)) }],
            { height: '100%' }
        )
        update(this.container, { width: window.getComputedStyle(this.container).height })
        this.rgbText = make(tag.SPAN, this.container)
        this.hexText = make(tag.SPAN, this.container)
        this.setColor(this.color)
    }

    initialize = () => document.addEventListener('colorchange', ({ detail: d }) =>
        this.setColor(d.color))

    updateLabel = color => {
        const updateTextColor = color => {
            const [, sat, val] = RGBtoHSV(...color)
            return (sat <= 0.25 && val >= 0.7) ? BLACK : WHITE
        }
        update(this.container, { background: rgbToStr(color) })
        update(this.rgbText, { color: updateTextColor(color) })
        update(this.hexText, { color: updateTextColor(color) })
        modify(this.rgbText, [{ innerHTML: rgbToStr(color) }])
        modify(this.hexText, [{ innerHTML: rgbToHexStr(color) }])
    }
}