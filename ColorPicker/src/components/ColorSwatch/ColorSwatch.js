import { createElement as make, rgbToStr } from '../../utils/utils.js'
import { SW_BG, SW_BG_CNAME, SW_ID, SW_CLEAR_CNAME } from '../../constants/attributes.js'
import { eventType, tag } from '../../constants/enums.js'

export default class ColorSwatch {
    constructor(parent, color) {
        this.parent = parent
        this.color = color
        this.format()
        this.initialize()
    }

    setColor = color => this.color = color

    getColor = () => this.color

    setElement = element => this.element = element

    getElement = () => this.element

    format = () => {
        const clear = () => {
            swatchBg.style.background = SW_BG
            clearBtn.classList.remove('show')
            swatchBg.classList.add('show')
        }

        const enter = () => swatchBg.style.background !== SW_BG ?
            clearBtn.classList.add('show') : swatchBg.classList.add('show')

        const leave = () => {
            clearBtn.classList.remove('show')
            swatchBg.classList.remove('show')
        }

        const down = () => {
            swatchBg.style.background = rgbToStr(this.color)
            swatchBg.classList.remove('show')
            clearBtn.classList.add('show')
        }

        const container = make(tag.DIV, this.parent, [
            { className: SW_ID },
            { onmouseenter: () => enter() },
            { onmouseleave: () => leave() }
        ])

        const swatchBg = make(tag.DIV, container,
            [{ className: SW_BG_CNAME },
            { onmousedown: () => down() }],
            { background: SW_BG }
        )

        const clearBtn = make(tag.SPAN, container, [
            { className: SW_CLEAR_CNAME },
            { onclick: () => clear() }
        ])

        this.setElement(container)
    }

    initialize = () => document.addEventListener('colorchange', ({ detail: d }) =>
        [eventType.PANEL, eventType.RGB, eventType.HEX, eventType.PICKER].some(e => d.type === e) &&
        this.setColor(d.color))
}