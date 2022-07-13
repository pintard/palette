import {
    createElement as make, setElementStyles as update, setElementProps as modify,
    rgbToHexStr, rgbToStr
} from '../../utils/utils.js'
import { RGBtoHSV } from '../../utils/conversions.js'
import { color, tag } from '../../constants/enums.js'
import { LABEL_ID } from '../../constants/attributes.js'

const { BLACK, WHITE } = color

export default class ColorLabel {
    constructor(parent, color) {
        this.parent = parent
        this.color = color
        this.format()
        this.initialize()
    }

    setColor = color => {
        this.color = color
        this.updateLabel(color)
    }

    getColor = () => this.color

    setElement = element => this.element = element

    getElement = () => this.element

    format = () => {
        /** Builds color label container */
        const container = make(tag.SPAN, this.parent,
            [{ id: LABEL_ID },
            { onclick: () => navigator.clipboard.writeText(rgbToHexStr(this.color)) }],
            { height: '100%' }
        )
        update(container, { width: window.getComputedStyle(container).height })

        /** Builds color label texts */
        this.rgbText = make(tag.SPAN, container)
        this.hexText = make(tag.SPAN, container)

        this.setElement(container)
        this.setColor(this.color)
    }

    initialize = () => document.addEventListener('colorchange', ({ detail: d }) => this.setColor(d.color))

    updateLabel = color => {
        const updateTextColor = color => {
            const [, sat, val] = RGBtoHSV(...color)
            return (sat <= 0.25 && val >= 0.7) ? BLACK : WHITE
        }
        update(this.element, { background: rgbToStr(color) })
        update(this.rgbText, { color: updateTextColor(color) })
        update(this.hexText, { color: updateTextColor(color) })
        modify(this.rgbText, [{ innerHTML: rgbToStr(color) }])
        modify(this.hexText, [{ innerHTML: rgbToHexStr(color) }])
    }
}