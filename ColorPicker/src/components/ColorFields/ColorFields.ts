import { createElement as make } from '../../utils/helper'
import { RGBtoHEX, HEXtoRGB } from '../../utils/conversions'
import { Tag, EventType } from '../../constants/enums'
import {
    B_FLD_ID, G_FLD_ID, HEXVW_ID, HEX_FLDS_CNAME, HXFLD_ID, RGBVW_ID, RGB_FLDS_CNAME, R_FLD_ID
} from '../../constants/attributes'
import { Color, ColorEvent } from '../../types/framework'
import { ColorComponent } from '../ColorComponent'

interface IndexMap { [key: string]: number }

const indexMap: IndexMap = Object.freeze({ [R_FLD_ID]: 0, [G_FLD_ID]: 1, [B_FLD_ID]: 2 })

/**
 * RGB Field Class
 * for interpreting r, g, b values, and dispatching color state changes
 */
export class RGBField implements ColorComponent {
    private id: string
    private color: Color
    public index: number
    private value: number
    private element: HTMLInputElement

    constructor(id: string, color: Color) {
        this.id = id
        this.color = color
        this.index = indexMap[id]
        this.value = color[this.index]
        this.format()
        this.initialize()
    }

    setValue = (value: number) => {
        this.color[this.index] = value
        this.value = value
        this.element.value = value.toString()
    }

    getValue = (): number => this.value

    setElement = (element: HTMLInputElement) => this.element = element

    getElement = (): HTMLInputElement => this.element

    format = (): void => {
        const isNumber = (e: KeyboardEvent): boolean =>
            (<HTMLInputElement>e.target).value.length <= 2 && (+e.key >= 0 && +e.key <= 9)

        const click = (e: MouseEvent): void => {
            const target = <HTMLInputElement>e.target
            if (target.value === '0') target.value = ''
        }

        const blur = (e: FocusEvent): void => {
            const target = <HTMLInputElement>e.target
            if (target.value === '') target.value = '0'
        }

        const field: HTMLInputElement = <HTMLInputElement>make(Tag.INPUT, RGBVW_ID, [
            { id: this.id },
            { className: RGB_FLDS_CNAME },
            { value: this.value },
            { onkeypress: (e: KeyboardEvent) => isNumber(e) },
            { onkeyup: (e: KeyboardEvent) => this.dispatch(e) },
            { onclick: (e: MouseEvent) => click(e) },
            { onblur: (e: FocusEvent) => blur(e) }
        ])

        this.setElement(field)
    }

    initialize = (): void => {
        document.addEventListener('colorchange', ({ detail: d }: ColorEvent): void => {
            if ([EventType.SLIDER, EventType.PANEL, EventType.HEX].some(t => d.type === t))
                this.setValue(d.color[this.index])
        })
    }

    dispatch = (e: KeyboardEvent): void => {
        this.setValue(+(<HTMLInputElement>e.target).value)

        document.dispatchEvent(new CustomEvent('colorchange', {
            detail: {
                color: this.color,
                changing: this.index,
                type: EventType.RGB,
                target: <HTMLElement>this.element
            }
        }))
    }
}

/**
 * HEX Field Class
 * for interpreting hex values, and dispatching color state changes
 */
export class HEXField implements ColorComponent {
    private color: Color
    private element: HTMLInputElement

    constructor(color: Color) {
        this.color = color
        this.format()
        this.initialize()
    }

    setColor = (color: Color) => {
        this.color = color
        this.element.value = RGBtoHEX(...this.color)
    }

    getColor = (): Color => this.color

    setElement = (element: HTMLInputElement) => this.element = element

    getElement = (): HTMLInputElement => this.element

    format = (): void => {
        const isHEX = (e: KeyboardEvent): boolean =>
            (<HTMLInputElement>e.target).value.length <= 5 && /[0-9A-F]/i.test(e.key)

        const field = <HTMLInputElement>make(Tag.INPUT, HEXVW_ID, [
            { id: HXFLD_ID },
            { className: HEX_FLDS_CNAME },
            { value: RGBtoHEX(...this.color) },
            { onkeypress: (e: KeyboardEvent) => isHEX(e) },
            { onkeyup: (e: KeyboardEvent) => this.dispatch(e) }
        ])

        this.setElement(field)
    }

    initialize = (): void => {
        document.addEventListener('colorchange', ({ detail: d }: ColorEvent): void => {
            if ([EventType.SLIDER, EventType.PANEL, EventType.RGB].some(t => d.type === t))
                this.setColor(d.color)
        })
    }

    dispatch = (e: KeyboardEvent): void => {
        const temp: Color = this.color
        let index: number = -1

        setTimeout(() => {
            try {
                this.setColor(HEXtoRGB((<HTMLInputElement>e.target).value))
                index = temp.findIndex((val: number, i: number) => val !== this.color[i])
            } catch (error) { console.warn('ERROR: Incomplete Hex') }

            document.dispatchEvent(new CustomEvent('colorchange', {
                detail: {
                    color: this.color,
                    changing: index,
                    type: EventType.HEX,
                    target: <HTMLElement>this.element
                }
            }))
        }, 100)
    }
}