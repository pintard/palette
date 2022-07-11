import { createElement as make, setElementStyles as update, rgbToStr } from '../../utils/utils.js'
import { RGBtoHSV } from '../../utils/conversions.js'
import { color, tag, eventType } from '../../constants/enums.js'
import { OUT_SLIDER_ID, SLIDER_ID, SLIDER_DRGR_ID, SL_CONT_HT, SL_DRGR_HT } from '../../constants/general_configs.js'

const HEIGHT_ADJ = 14
const MAX_VAL = 255

export default class ColorSlider {
    constructor(parent, color) {
        this.parent = parent
        this.color = color
        this.format()
        this.initialize()
    }

    getColor = () => this.color

    setColor = color => {
        this.color = color
        this.moveTo(this.getCoord(), true)
    }

    getCoord = () => Math.round((RGBtoHSV(...this.color)[0] / 360) * (this.width - 1))

    format = () => {
        /** Builds color slider */
        const containerHeight = SL_CONT_HT + HEIGHT_ADJ + 'px'
        this.container = make(tag.DIV, this.parent,
            [{ id: OUT_SLIDER_ID }],
            { width: '100%', height: containerHeight }
        )
        this.width = parseInt(window.getComputedStyle(this.container).width)
        this.height = SL_CONT_HT

        /** Builds canvas in slider */
        this.canvas = make(tag.CANVAS, this.container, [
            { id: SLIDER_ID },
            { width: this.width },
            { height: this.height }
        ])
        this.context = this.canvas.getContext('2d')
        this.fillSlider()

        /** Builds dragger */
        this.dragger = make(tag.SPAN, this.container,
            [{ id: SLIDER_DRGR_ID }],
            { width: SL_DRGR_HT, height: containerHeight }
        )
        this.moveTo(this.getCoord(), true)
        this.down()
    }

    initialize = () => document.addEventListener('colorchange', ({ detail: d }) => {
        if ([eventType.RGB, eventType.HEX, eventType.PICKER].some(e => d.type === e))
            this.setColor(d.color)
    })

    dispatch = () => document.dispatchEvent(new CustomEvent('colorchange', {
        detail: { color: this.color, type: eventType.SLIDER }
    }))

    fillSlider = () => {
        const SOLID_RADIUS = 1 / 1000, MID_PT = (this.height / 2) - 1, END_PT = this.width - 1
        const hueGrad = this.context.createLinearGradient(0, MID_PT, END_PT, MID_PT)
        hueGrad.addColorStop(0, color.RED)
        hueGrad.addColorStop(0 + (SOLID_RADIUS * 2), color.RED)
        hueGrad.addColorStop((1 / 6) - SOLID_RADIUS, color.YELLOW)
        hueGrad.addColorStop((1 / 6) + SOLID_RADIUS, color.YELLOW)
        hueGrad.addColorStop((2 / 6) - SOLID_RADIUS, color.GREEN)
        hueGrad.addColorStop((2 / 6) + SOLID_RADIUS, color.GREEN)
        hueGrad.addColorStop((3 / 6) - SOLID_RADIUS, color.CYAN)
        hueGrad.addColorStop((3 / 6) + SOLID_RADIUS, color.CYAN)
        hueGrad.addColorStop((4 / 6) - SOLID_RADIUS, color.BLUE)
        hueGrad.addColorStop((4 / 6) + SOLID_RADIUS, color.BLUE)
        hueGrad.addColorStop((5 / 6) - SOLID_RADIUS, color.MAGENTA)
        hueGrad.addColorStop((5 / 6) + SOLID_RADIUS, color.MAGENTA)
        hueGrad.addColorStop(1 - (SOLID_RADIUS * 2), color.RED)
        hueGrad.addColorStop(1, color.RED)
        this.context.fillStyle = hueGrad
        this.context.fillRect(0, 0, this.width, this.height)
    }

    down = () => {
        const container = this.canvas.getBoundingClientRect()
        const move = e => {
            if (e) this.moveTo(e.clientX - container.left)
            this.move(container)
            this.release()
        }
        this.dragger.onmousedown = () => move()
        this.canvas.onmousedown = e => move(e)
    }

    release = () => document.body.onmouseup = () => {
        document.body.onmousemove = null
        document.body.onmouseup = null
        this.report()
    }

    move = container => document.body.onmousemove = e => {
        const x = e.clientX - container.left
        if (x >= 0 && x < this.width) this.moveTo(x)
    }

    moveTo = (x, dispatch) => {
        this.color = (x >= this.width - 1 || x < 0) ? [MAX_VAL, 0, 0] : this.colorAt(x)
        this.x = x
        update(this.dragger, {
            left: x - (this.dragger.offsetWidth / 2) + 'px',
            background: rgbToStr(this.color)
        })
        if (!dispatch) this.dispatch()
    }

    colorAt = x => Array.from(this.context.getImageData(x, 0, 1, 1).data.slice(0, 3))

    report = () => console.log(`RGB\x1b[36m x: ${Math.round(this.x)}\x1b[0m`, this.color)
}