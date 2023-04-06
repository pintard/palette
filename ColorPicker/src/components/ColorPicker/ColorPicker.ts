import { HEXField, RGBField, ColorLabel, ColorPanel, ColorSlider, ColorSwatch } from '..'
import { createElement as make } from '../../utils/utils'
import {
    CTRLS_BG, CTRLS_DSP, SW_COUNT, SWS_ID, CTRLS_CNAME, FVIEW_CNAME, HEXVW_ID, RGBVW_ID, RGB_LBL, HEX_LBL,
    RGB_BTN_ID, HEX_BTN_ID, R_FLD_ID, G_FLD_ID, B_FLD_ID, FLDS_ID, CTRLS_NAV_ID, PCKR_ROW_1,
    PCKR_ROW_2, PCKR_ROW_3, PCKR_ROW_4, PCKR_ID
} from '../../constants/attributes'
import { Tag, EventType } from '../../constants/enums'
import StyleFactory from '../../utils/StyleFactory'
import { Color, ColorEvent } from '../../types/framework'
import { ColorComponent } from '../ColorComponent'

const MAX_VAL: number = 255

export default class ColorPicker implements ColorComponent {
    private parent: HTMLElement
    private color: Color
    private element: HTMLDivElement
    public colorLabel: ColorLabel
    public colorPanel: ColorPanel
    public colorSlider: ColorSlider
    public redField: RGBField
    public greenField: RGBField
    public blueField: RGBField
    public hexField: HEXField
    public swatchesContainer: HTMLDivElement
    public swatches: ColorSwatch[]

    constructor(id: string, color: Color) {
        this.parent = <HTMLElement>document.getElementById(id)
        this.color = color
        this.setUp()
    }

    setColor = (color: Color) => this.color = color

    getColor = (): Color => this.color

    setElement = (element: HTMLDivElement) => this.element = element

    getElement = (): HTMLDivElement => this.element

    setUp = (): Promise<void> => StyleFactory.setUp({ format: this.format, init: this.initialize })

    format = (): void => {
        const container = <HTMLDivElement>make(Tag.DIV, this.parent, [{ id: PCKR_ID }])
        /** First row with field container and color label */
        const row = <HTMLDivElement>make(Tag.DIV, container, [{ className: PCKR_ROW_1 }])
        this.buildFields(row)
        this.colorLabel = new ColorLabel(row, this.color)
        /** Second row with color panel */
        this.colorPanel = new ColorPanel(<HTMLDivElement>make(Tag.DIV, container, [{ className: PCKR_ROW_2 }]), this.color)
        /** Third row with color slider */
        this.colorSlider = new ColorSlider(<HTMLDivElement>make(Tag.DIV, container, [{ className: PCKR_ROW_3 }]), this.color)
        /** Fourth row with swatch group */
        this.buildSwatches(<HTMLDivElement>make(Tag.DIV, container, [{ className: PCKR_ROW_4 }]), SW_COUNT)

        this.setElement(container)
    }

    initialize = (): void => {
        document.addEventListener('colorchange', (e: ColorEvent): void => {
            const { detail: d } = e
            if (d.type !== EventType.PICKER) {
                this.setColor(d.color)
                let hasExtreme: boolean = false
                this.color.forEach((val: number, i: number) => {
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
    }

    dispatch = (): void => {
        document.dispatchEvent(new CustomEvent('colorchange', {
            detail: {
                color: this.color,
                type: EventType.PICKER,
                target: <HTMLElement>this.element
            }
        }))
    }

    buildFields = (parent: HTMLDivElement): void => {
        const changeView = (e: MouseEvent): void => {
            const btns = <HTMLElement[]>Array.from(document.getElementsByClassName(CTRLS_CNAME))
            const views = <HTMLElement[]>Array.from(document.getElementsByClassName(FVIEW_CNAME))
            btns.forEach((btn: HTMLElement, i: number): void => {
                btn.style.background = btn === e.target ? CTRLS_BG : 'none'
                views[i].style.display = btn === e.target ? CTRLS_DSP : 'none'
            })
        }

        const container = <HTMLDivElement>make(Tag.DIV, parent, [{ id: FLDS_ID }])
        const controls = <HTMLSpanElement>make(Tag.SPAN, container, [{ id: CTRLS_NAV_ID }])

        make(Tag.DIV, container, [{ id: RGBVW_ID }, { className: FVIEW_CNAME }])

        make(Tag.DIV, container, [{ id: HEXVW_ID }, { className: FVIEW_CNAME }])

        make(Tag.BUTTON, controls, [
            { id: RGB_BTN_ID },
            { className: CTRLS_CNAME },
            { innerHTML: RGB_LBL },
            { onclick: (e: MouseEvent) => changeView(e) }
        ])

        make(Tag.BUTTON, controls, [
            { id: HEX_BTN_ID },
            { className: CTRLS_CNAME },
            { innerHTML: HEX_LBL },
            { onclick: (e: MouseEvent) => changeView(e) }
        ])

        this.redField = new RGBField(R_FLD_ID, this.color)
        this.greenField = new RGBField(G_FLD_ID, this.color)
        this.blueField = new RGBField(B_FLD_ID, this.color)
        this.hexField = new HEXField(this.color)
    }

    buildSwatches = (parent: HTMLDivElement, count: number): void => {
        this.swatchesContainer = <HTMLDivElement>make(Tag.DIV, parent, [{ id: SWS_ID }])
        this.swatches = new Array(count)
        while (count--) this.swatches.push(new ColorSwatch(this.swatchesContainer, this.color))
    }
}