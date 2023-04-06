import { createElement as make, rgbToStr } from '../../utils/utils'
import { SW_BG, SW_BG_CNAME, SW_ID, SW_CLEAR_CNAME } from '../../constants/attributes'
import { EventType, Tag } from '../../constants/enums'
import { Color, ColorEvent } from '../../types/framework'
import { ColorComponent } from '../ColorComponent'

export default class ColorSwatch implements ColorComponent {
    public parent: HTMLElement
    public color: Color
    public element: HTMLDivElement

    constructor(parent: HTMLElement, color: Color) {
        this.parent = parent
        this.color = color
        this.format()
        this.initialize()
    }

    setColor = (color: Color) => this.color = color

    getColor = (): Color => this.color

    setElement = (element: HTMLDivElement) => this.element = element

    getElement = (): HTMLDivElement => this.element

    format = (): void => {
        const clear = (): void => {
            swatchBg.style.background = SW_BG
            clearBtn.classList.remove('show')
            swatchBg.classList.add('show')
        }

        const enter = (): void => {
            swatchBg.style.background !== SW_BG ?
                clearBtn.classList.add('show') :
                swatchBg.classList.add('show')
        }

        const leave = (): void => {
            clearBtn.classList.remove('show')
            swatchBg.classList.remove('show')
        }

        const down = (): void => {
            swatchBg.style.background = rgbToStr(this.color)
            swatchBg.classList.remove('show')
            clearBtn.classList.add('show')
        }

        const container = <HTMLDivElement>make(Tag.DIV, this.parent, [
            { className: SW_ID },
            { onmouseenter: () => enter() },
            { onmouseleave: () => leave() }
        ])

        const swatchBg = <HTMLDivElement>make(Tag.DIV, container,
            [{ className: SW_BG_CNAME },
            { onmousedown: () => down() }],
            { background: SW_BG }
        )

        const clearBtn = <HTMLSpanElement>make(Tag.SPAN, container, [
            { className: SW_CLEAR_CNAME },
            { onclick: () => clear() }
        ])

        this.setElement(container)
    }

    initialize = (): void => {
        document.addEventListener('colorchange', ({ detail: d }: ColorEvent): void => {
            if ([EventType.PANEL, EventType.RGB, EventType.HEX, EventType.PICKER].some(t => d.type === t))
                this.setColor(d.color)
        })
    }
}