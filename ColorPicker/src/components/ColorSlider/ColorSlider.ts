import { createElement as make, setElementStyles as update, rgbToStr } from '../../utils/helper'
import { RGBtoHSV } from '../../utils/conversions'
import { Colors, Tag, EventType } from '../../constants/enums'
import { OUT_SLIDER_ID, SLIDER_ID, SLIDER_DRGR_ID, SL_CONT_HT, SL_DRGR_HT } from '../../constants/attributes'
import { Color, ColorEvent, Coord } from '../../types/framework'
import { ColorComponent } from '../ColorComponent'

const HEIGHT_ADJ: number = 14
const MAX_VAL: number = 255

export default class ColorSlider implements ColorComponent {
    private parent: HTMLElement
    private color: Color
    private element: HTMLDivElement
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D
    private dragger: HTMLSpanElement
    private width: number
    private height: number
    private x: Coord

    constructor(parent: HTMLElement, color: Color) {
        this.parent = parent
        this.color = color
        this.format()
        this.initialize()
    }

    setColor = (color: Color) => {
        this.color = color
        this.moveTo(this.getCoord(), true)
    }

    getColor = (): Color => this.color

    setElement = (element: HTMLDivElement) => this.element = element

    getElement = (): HTMLDivElement => this.element

    getCoord = (): Coord => Math.round((RGBtoHSV(...this.color)[0] / 360) * (this.width - 1))

    format = (): void => {
        const containerHeight: string = SL_CONT_HT + HEIGHT_ADJ + 'px'
        /** Builds color slider */
        const container = <HTMLDivElement>make(Tag.DIV, this.parent,
            [{ id: OUT_SLIDER_ID }],
            { width: '100%', height: containerHeight }
        )
        this.width = parseInt(window.getComputedStyle(container).width)
        this.height = SL_CONT_HT

        /** Builds canvas in slider */
        this.canvas = <HTMLCanvasElement>make(Tag.CANVAS, container, [
            { id: SLIDER_ID },
            { width: this.width },
            { height: this.height }
        ])
        this.context = <CanvasRenderingContext2D>this.canvas.getContext('2d')
        this.fillSlider()

        /** Builds dragger */
        this.dragger = <HTMLSpanElement>make(Tag.SPAN, container,
            [{ id: SLIDER_DRGR_ID }],
            { width: SL_DRGR_HT, height: containerHeight }
        )
        this.moveTo(this.getCoord(), true)

        this.setElement(container)
        this.down()
    }

    initialize = (): void => {
        document.addEventListener('colorchange', ({ detail: d }: ColorEvent): void => {
            if ([EventType.RGB, EventType.HEX, EventType.PICKER].some(t => d.type === t))
                this.setColor(d.color)
        })
    }

    dispatch = (): void => {
        document.dispatchEvent(new CustomEvent('colorchange', {
            detail: {
                color: this.color,
                type: EventType.SLIDER,
                target: <HTMLElement>this.element
            }
        }))
    }

    fillSlider = (): void => {
        const SOLID_RADIUS: number = 1 / 1000
        const MID_PT: number = (this.height / 2) - 1
        const END_PT: number = this.width - 1
        /** Fill slider canvas */
        const hueGrad: CanvasGradient = this.context.createLinearGradient(0, MID_PT, END_PT, MID_PT)
        hueGrad.addColorStop(0, Colors.RED)
        hueGrad.addColorStop(0 + (SOLID_RADIUS * 2), Colors.RED)
        hueGrad.addColorStop((1 / 6) - SOLID_RADIUS, Colors.YELLOW)
        hueGrad.addColorStop((1 / 6) + SOLID_RADIUS, Colors.YELLOW)
        hueGrad.addColorStop((2 / 6) - SOLID_RADIUS, Colors.GREEN)
        hueGrad.addColorStop((2 / 6) + SOLID_RADIUS, Colors.GREEN)
        hueGrad.addColorStop((3 / 6) - SOLID_RADIUS, Colors.CYAN)
        hueGrad.addColorStop((3 / 6) + SOLID_RADIUS, Colors.CYAN)
        hueGrad.addColorStop((4 / 6) - SOLID_RADIUS, Colors.BLUE)
        hueGrad.addColorStop((4 / 6) + SOLID_RADIUS, Colors.BLUE)
        hueGrad.addColorStop((5 / 6) - SOLID_RADIUS, Colors.MAGENTA)
        hueGrad.addColorStop((5 / 6) + SOLID_RADIUS, Colors.MAGENTA)
        hueGrad.addColorStop(1 - (SOLID_RADIUS * 2), Colors.RED)
        hueGrad.addColorStop(1, Colors.RED)
        this.context.fillStyle = hueGrad
        this.context.fillRect(0, 0, this.width, this.height)
    }

    down = (): void => {
        const container: DOMRect = this.canvas.getBoundingClientRect()
        const move = (e?: MouseEvent): void => {
            if (e) this.moveTo(e.clientX - container.left)
            this.move(container)
            this.release()
        }
        this.dragger.onmousedown = (): void => move()
        this.canvas.onmousedown = (e: MouseEvent): void => move(e)
    }

    release = (): void => {
        document.body.onmouseup = (): void => {
            document.body.onmousemove = null
            document.body.onmouseup = null
            this.report()
        }
    }

    move = (container: DOMRect): void => {
        document.body.onmousemove = (e: MouseEvent): void => {
            const x: number = e.clientX - container.left
            if (x >= 0 && x < this.width) this.moveTo(x)
        }
    }

    moveTo = (x: number, dispatch?: boolean): void => {
        this.color = (x >= this.width - 1 || x < 0) ? [MAX_VAL, 0, 0] : this.colorAt(x)
        this.x = x
        update(this.dragger, {
            left: x - (this.dragger.offsetWidth / 2) + 'px',
            background: rgbToStr(this.color)
        })
        if (!dispatch) this.dispatch()
    }

    colorAt = (x: Coord): Color => <Color>Array.from(this.context.getImageData(x, 0, 1, 1).data.slice(0, 3))

    report = (): void => console.log(`RGB\x1b[36m x: ${Math.round(this.x)}\x1b[0m`, this.color)
}