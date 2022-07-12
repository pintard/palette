import { createElement as make, setElementStyles as update, rgbaToStr, rgbToStr } from '../../utils/utils.js'
import { RGBtoHSV, HSVtoRGB } from '../../utils/conversions.js'
import { eventType, tag } from '../../constants/enums.js'
import { OUT_PANEL_ID, PANEL_ID, PANEL_DRGR_ID } from '../../constants/attributes.js'

const MAX_VAL = 255

export default class ColorPanel {
    constructor(parent, color) {
        this.parent = parent
        this.color = color
        this.format()
        this.initialize()
    }

    getColor = () => this.color

    setColor = color => {
        this.fillPanel(color)
        this.color = color
        this.moveTo(...this.getCoords(), true)
    }

    getHueColor = () => this.hueColor

    setHueColor = color => {
        const hue = RGBtoHSV(...color)[0]
        this.hueColor = HSVtoRGB(hue, 1, 1)
    }

    getCoords = () => {
        const [, sat, val] = RGBtoHSV(...this.color)
        const x = Math.round(sat * (this.width - 1))
        const y = Math.round((this.height - 1) * (1 - val))
        return [x, y]
    }

    format = () => {
        /** Builds color panel */
        this.container = make(tag.DIV, this.parent, [{ id: OUT_PANEL_ID }], { width: '100%' })
        this.width = parseInt(window.getComputedStyle(this.container).width)
        this.height = Math.round(this.width / 2)
        update(this.container, { height: this.height + 'px' })

        /** Builds canvas in color panel */
        this.canvas = make(tag.CANVAS, this.container, [
            { id: PANEL_ID },
            { width: this.width },
            { height: this.height }
        ])
        this.context = this.canvas.getContext('2d')
        this.fillPanel(this.color)

        /** Builds dragger */
        this.dragger = make(tag.SPAN, this.container, [{ id: PANEL_DRGR_ID }])
        this.moveTo(...this.getCoords(), true)
        this.down()
    }

    initialize = () => document.addEventListener('colorchange', ({ detail: d }) => {
        if (d.type === eventType.SLIDER) {
            this.fillPanel(d.color)
            this.color = this.colorAt(...Object.values(this.position))
            update(this.dragger, { background: rgbToStr(this.color) })
            this.dispatch()
        }

        if ([eventType.RGB, eventType.HEX, eventType.PICKER].some(e => d.type === e))
            this.setColor(d.color)
    })

    dispatch = () => document.dispatchEvent(new CustomEvent('colorchange', {
        detail: { color: this.color, type: eventType.PANEL }
    }))

    fillPanel = color => {
        this.setHueColor(color)

        const MID_POINT_H = (this.height / 2) - 1
        const END_POINT_H = this.width - 1
        const MID_POINT_V = (this.width / 2) - 1
        const END_POINT_V = this.height - 1
        const SOLID_RADIUS = 2 / 1000

        /** Fill observation color */
        this.context.fillStyle = rgbToStr(this.hueColor)
        this.context.fillRect(0, 0, this.width, this.height)

        /** Add saturation gradient */
        const satGrad = this.context.createLinearGradient(0, MID_POINT_H, END_POINT_H, MID_POINT_H)
        satGrad.addColorStop(SOLID_RADIUS, rgbaToStr([MAX_VAL, MAX_VAL, MAX_VAL, 1]))
        satGrad.addColorStop(1, rgbaToStr([MAX_VAL, MAX_VAL, MAX_VAL, 0]))
        this.context.fillStyle = satGrad
        this.context.fillRect(0, 0, this.width, this.height)

        /** Add light gradient */
        const lightGrad = this.context.createLinearGradient(MID_POINT_V, 0, MID_POINT_V, END_POINT_V)
        lightGrad.addColorStop(SOLID_RADIUS, rgbaToStr([0, 0, 0, 0]))
        lightGrad.addColorStop(1, rgbaToStr([0, 0, 0, 1]))
        this.context.fillStyle = lightGrad
        this.context.fillRect(0, 0, this.width, this.height)
    }

    down = () => {
        const container = this.canvas.getBoundingClientRect()
        const move = e => {
            if (e) this.moveTo(e.clientX - container.left, e.clientY - container.top)
            this.move(container)
            this.leave(container)
            this.release()
        }
        this.dragger.onmousedown = () => move()
        this.canvas.onmousedown = e => move(e)
    }

    leave = container => {
        this.container.onmouseleave = () => document.body.onmousemove = e => {
            const x = e.clientX - container.left, y = e.clientY - container.top
            if (x >= 0 && x < this.width) this.moveTo(x, y >= this.height ? this.height - 1 : 0)
            else if (y >= 0 && y < this.height) this.moveTo(x >= this.width ? this.width - 1 : 0, y)
        }
        this.container.onmouseenter = () => this.move(container)
    }

    release = () => document.body.onmouseup = () => {
        document.body.onmousemove = null
        document.body.onmouseup = null
        this.container.onmouseleave = null
        this.container.onmouseenter = null
        this.report()
    }

    move = container => document.body.onmousemove = e => {
        const x = e.clientX - container.left, y = e.clientY - container.top
        if ((x >= 0 && x < this.width) && (y >= 0 && y < this.height)) this.moveTo(x, y)
    }

    moveTo = (x, y, dispatch) => {
        this.color = this.colorAt(x, y)
        this.position = { x: x, y: y }
        update(this.dragger, {
            left: x - (this.dragger.offsetWidth / 2) + 'px',
            top: y - (this.dragger.offsetHeight / 2) + 'px',
            background: rgbToStr(this.color)
        })
        if (!dispatch) this.dispatch()
    }

    colorAt = (x, y) => Array.from(this.context.getImageData(x, y, 1, 1).data.slice(0, 3))

    report = () => console.log('RGB \x1b[36mx: %s, y: %s\x1b[0m', ...Object.values(this.position), this.color)
}