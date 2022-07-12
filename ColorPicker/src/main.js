import { HEXField, RGBField, ColorLabel, ColorPanel, ColorSlider, ColorSwatch } from './components/index.js'
import { createElement as make } from './utils/utils.js'
import {
    CTRLS_BG, CTRLS_DSP, SW_COUNT, SWS_ID, CTRLS_CNAME, FVIEW_CNAME, HEXVW_ID, RGBVW_ID, RGB_LBL, HEX_LBL, RGB_BTN_ID, HEX_BTN_ID,
    R_FLD_ID, G_FLD_ID, B_FLD_ID, FLDS_ID, CTRLS_NAV_ID, HXFLD_ID, PCKR_ROW_1, PCKR_ROW_2, PCKR_ROW_3, PCKR_ROW_4
} from './constants/general_configs.js'
import { tag, eventType } from './constants/enums.js'

const MAX_VAL = 255

export default class ColorPicker {
    constructor(id, color) {
        this.id = id
        this.color = color
        this.parent = document.getElementById(id)
        this.format()
        this.initialize()
    }

    getColor = () => this.color

    setColor = color => this.color = color

    format = () => {
        /** First row with field container and color label */
        const topRow = make(tag.DIV, this.parent, [{ className: PCKR_ROW_1 }])
        this.buildFields(topRow)
        this.colorLabel = new ColorLabel(topRow, this.color)

        /** Second row with color panel */
        this.colorPanel = new ColorPanel(
            make(tag.DIV, this.parent, [{ className: PCKR_ROW_2 }]), this.color)

        /** Third row with color slider */
        this.colorSlider = new ColorSlider(
            make(tag.DIV, this.parent, [{ className: PCKR_ROW_3 }]), this.color)

        /** Fourth row with swatch group */
        this.buildSwatches(make(tag.DIV, this.parent, [{ className: PCKR_ROW_4 }]), SW_COUNT)
    }

    initialize = () => document.addEventListener('colorchange', ({ detail: d }) => {
        if (d.type !== eventType.PICKER) {
            this.setColor(d.color)
            let hasExtreme = false

            this.color.forEach((val, i) => {
                if (val > MAX_VAL) {
                    console.warn('WARNING: Extreme found', val)
                    this.color[i] = MAX_VAL
                    hasExtreme = true
                }
            })

            if (hasExtreme) {
                this.dispatch()
                e.stopPropagation()
            }
        }
    })

    dispatch = () => document.dispatchEvent(new CustomEvent('colorchange', {
        detail: { color: this.color, type: eventType.PICKER }
    }))

    buildFields = parent => {
        const changeView = e => {
            const btns = Array.from(document.getElementsByClassName(CTRLS_CNAME))
            const views = Array.from(document.getElementsByClassName(FVIEW_CNAME))

            btns.forEach((btn, i) => {
                btn.style.background = btn === e.target ? CTRLS_BG : "none"
                views[i].style.display = btn === e.target ? CTRLS_DSP : "none"
            })
        }

        const container = make(tag.DIV, parent, [{ id: FLDS_ID }])
        const controls = make(tag.SPAN, container, [{ id: CTRLS_NAV_ID }])

        make(tag.DIV, container, [
            { id: RGBVW_ID },
            { className: FVIEW_CNAME }
        ])

        make(tag.DIV, container, [
            { id: HEXVW_ID },
            { className: FVIEW_CNAME }
        ])

        make(tag.BUTTON, controls, [
            { id: RGB_BTN_ID },
            { className: CTRLS_CNAME },
            { innerHTML: RGB_LBL },
            { onclick: e => changeView(e) }
        ])

        make(tag.BUTTON, controls, [
            { id: HEX_BTN_ID },
            { className: CTRLS_CNAME },
            { innerHTML: HEX_LBL },
            { onclick: e => changeView(e) }
        ])

        this.rField = new RGBField(R_FLD_ID, this.color)
        this.gField = new RGBField(G_FLD_ID, this.color)
        this.bField = new RGBField(B_FLD_ID, this.color)
        this.hexField = new HEXField(HXFLD_ID, this.color)
    }

    buildSwatches = (parent, count) => {
        this.swatchesContainer = make(tag.DIV, parent, [{ id: SWS_ID }])
        this.swatches = new Array(count)
        while (count--) this.swatches.push(new ColorSwatch(this.swatchesContainer, this.color))
    }
}