import { createElement as make, setElementStyles as update, rgbaToStr, rgbToStr } from '../../utils/utils'
import { RGBtoHSV, HSVtoRGB } from '../../utils/conversions'
import { EventType, Tag } from '../../constants/enums'
import { OUT_PANEL_ID, PANEL_ID, PANEL_DRGR_ID } from '../../constants/attributes'
import { Color, ColorEvent, Coords } from '../../types/framework'

const MAX_VAL: number = 255

export default class ColorPanel {
    private parent: HTMLElement
    private color: Color
    private element: HTMLDivElement
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D
    private dragger: HTMLSpanElement
    private position: Coords
    private hueColor: Color
    private width: number
    private height: number

    constructor(parent: HTMLElement, color: Color) {
        this.parent = parent
        this.color = color
        this.format()
        this.initialize()
    }

    setColor = (color: Color) => {
        this.fillPanel(color)
        this.color = color
        this.moveTo(...this.getCoords(), true)
    }

    getColor = (): Color => this.color

    setElement = (element: HTMLDivElement) => this.element = element

    getElement = (): HTMLDivElement => this.element

    setHueColor = (color: Color) => {
        const hue: number = RGBtoHSV(...color)[0]
        this.hueColor = HSVtoRGB(hue, 1, 1)
    }

    getHueColor = (): Color => this.hueColor

    getCoords = (): Coords => {
        const [, sat, val] = RGBtoHSV(...this.color)
        const x = Math.round(sat * (this.width - 1))
        const y = Math.round((this.height - 1) * (1 - val))
        return [x, y]
    }

    format = (): void => {
        /** Builds color panel */
        const container = <HTMLDivElement>make(Tag.DIV, this.parent, [{ id: OUT_PANEL_ID }], { width: '100%' })
        this.width = parseInt(window.getComputedStyle(container).width)
        this.height = Math.round(this.width / 2)
        update(container, { height: this.height + 'px' })

        /** Builds canvas in color panel */
        this.canvas = <HTMLCanvasElement>make(Tag.CANVAS, container, [
            { id: PANEL_ID },
            { width: this.width },
            { height: this.height }
        ])
        this.context = <CanvasRenderingContext2D>this.canvas.getContext('2d')
        this.fillPanel(this.color)

        /** Builds dragger */
        this.dragger = <HTMLSpanElement>make(Tag.SPAN, container, [{ id: PANEL_DRGR_ID }])
        this.moveTo(...this.getCoords(), true)

        this.setElement(container)
        this.down()
    }

    initialize = (): void => {
        document.addEventListener('colorchange', ({ detail: d }: ColorEvent): void => {
            if (d.type === EventType.SLIDER) {
                this.fillPanel(d.color)
                this.color = this.colorAt(...this.position)
                update(this.dragger, { background: rgbToStr(this.color) })
                this.dispatch()
            }
            if ([EventType.RGB, EventType.HEX, EventType.PICKER].some(t => d.type === t))
                this.setColor(d.color)
        })
    }

    dispatch = (): void => {
        document.dispatchEvent(new CustomEvent('colorchange', {
            detail: {
                color: this.color,
                type: EventType.PANEL,
                target: <HTMLElement>this.element
            }
        }))
    }

    fillPanel = (color: Color): void => {
        this.setHueColor(color)

        const MID_POINT_H: number = (this.height / 2) - 1
        const END_POINT_H: number = this.width - 1
        const MID_POINT_V: number = (this.width / 2) - 1
        const END_POINT_V: number = this.height - 1
        const SOLID_RADIUS: number = 2 / 1000

        /** Fill observation color */
        this.context.fillStyle = rgbToStr(this.hueColor)
        this.context.fillRect(0, 0, this.width, this.height)

        /** Add saturation gradient */
        const satGrad: CanvasGradient = this.context.createLinearGradient(0, MID_POINT_H, END_POINT_H, MID_POINT_H)
        satGrad.addColorStop(SOLID_RADIUS, rgbaToStr([MAX_VAL, MAX_VAL, MAX_VAL, 1]))
        satGrad.addColorStop(1, rgbaToStr([MAX_VAL, MAX_VAL, MAX_VAL, 0]))
        this.context.fillStyle = satGrad
        this.context.fillRect(0, 0, this.width, this.height)

        /** Add light gradient */
        const lightGrad: CanvasGradient = this.context.createLinearGradient(MID_POINT_V, 0, MID_POINT_V, END_POINT_V)
        lightGrad.addColorStop(SOLID_RADIUS, rgbaToStr([0, 0, 0, 0]))
        lightGrad.addColorStop(1, rgbaToStr([0, 0, 0, 1]))
        this.context.fillStyle = lightGrad
        this.context.fillRect(0, 0, this.width, this.height)
    }

    down = (): void => {
        const container: DOMRect = this.canvas.getBoundingClientRect()
        const move = (e?: MouseEvent): void => {
            if (e) this.moveTo(e.clientX - container.left, e.clientY - container.top)
            this.move(container)
            this.leave(container)
            this.release()
        }
        this.dragger.onmousedown = (): void => move()
        this.canvas.onmousedown = (e: MouseEvent): void => move(e)
    }

    leave = (container: DOMRect): void => {
        this.element.onmouseleave = () => document.body.onmousemove = e => {
            const x: number = e.clientX - container.left, y: number = e.clientY - container.top
            if (x >= 0 && x < this.width) this.moveTo(x, y >= this.height ? this.height - 1 : 0)
            else if (y >= 0 && y < this.height) this.moveTo(x >= this.width ? this.width - 1 : 0, y)
        }
        this.element.onmouseenter = () => this.move(container)
    }

    release = (): void => {
        document.body.onmouseup = (): void => {
            document.body.onmousemove = null
            document.body.onmouseup = null
            this.element.onmouseleave = null
            this.element.onmouseenter = null
            this.report()
        }
    }

    move = (container: DOMRect): void => {
        document.body.onmousemove = (e: MouseEvent): void => {
            const x: number = e.clientX - container.left, y: number = e.clientY - container.top
            if ((x >= 0 && x < this.width) && (y >= 0 && y < this.height)) this.moveTo(x, y)
        }
    }

    moveTo = (x: number, y: number, dispatch?: boolean): void => {
        this.color = this.colorAt(x, y)
        this.position = [x, y]
        update(this.dragger, {
            left: x - (this.dragger.offsetWidth / 2) + 'px',
            top: y - (this.dragger.offsetHeight / 2) + 'px',
            background: rgbToStr(this.color)
        })
        if (!dispatch) this.dispatch()
    }

    colorAt = (x: number, y: number): Color =>
        <Color>Array.from(this.context.getImageData(x, y, 1, 1).data.slice(0, 3))

    report = (): void => console.log('RGB \x1b[36mx: %s, y: %s\x1b[0m', ...this.position, this.color)
}