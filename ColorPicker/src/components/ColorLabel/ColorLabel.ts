import {
    createElement as make, setElementStyles as update, setElementProps as modify,
    rgbToHexStr, rgbToStr
} from '../../utils/helper'
import { RGBtoHSV } from '../../utils/conversions'
import { Colors, Tag } from '../../constants/enums'
import { LABEL_ID } from '../../constants/attributes'
import { Color, ColorEvent } from '../../types/framework'
import { ColorComponent } from '../ColorComponent'

const { BLACK, WHITE } = Colors

export default class ColorLabel implements ColorComponent {
    private parent: HTMLElement
    private color: Color
    private element: HTMLSpanElement
    private rgbText: HTMLSpanElement
    private hexText: HTMLSpanElement

    constructor(parent: HTMLElement, color: Color) {
        this.parent = parent
        this.color = color
        this.format()
        this.initialize()
    }

    setColor = (color: Color) => {
        this.color = color
        this.updateLabel(color)
    }

    getColor = (): Color => this.color

    setElement = (element: HTMLSpanElement) => this.element = element

    getElement = (): HTMLSpanElement => this.element

    format = (): void => {
        const copyColor = (color: Color): Promise<void> => navigator.clipboard.writeText(rgbToHexStr(color))

        /** Builds color label container */
        const container = <HTMLSpanElement>make(Tag.SPAN, this.parent,
            [{ id: LABEL_ID },
            { onclick: () => copyColor(this.color) }],
            { height: '100%' }
        )
        update(container, { width: window.getComputedStyle(container).height })

        /** Builds color label texts */
        this.rgbText = <HTMLSpanElement>make(Tag.SPAN, container)
        this.hexText = <HTMLSpanElement>make(Tag.SPAN, container)

        this.setElement(container)
        this.setColor(this.color)
    }

    initialize = (): void => { document.addEventListener('colorchange', ({ detail: d }: ColorEvent) => this.setColor(d.color)) }

    updateLabel = (color: Color): void => {
        const updateTextColor = (rgb: Color): Colors => {
            const [, sat, val] = RGBtoHSV(...rgb)
            return (sat <= 0.25 && val >= 0.7) ? BLACK : WHITE
        }
        update(this.element, { background: rgbToStr(color) })
        update(this.rgbText, { color: updateTextColor(color) })
        update(this.hexText, { color: updateTextColor(color) })
        modify(this.rgbText, [{ innerHTML: rgbToStr(color) }])
        modify(this.hexText, [{ innerHTML: rgbToHexStr(color) }])
    }
}