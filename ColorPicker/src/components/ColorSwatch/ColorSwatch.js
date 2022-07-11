import { createElement as make, rgbToStr } from '../../utils/utils.js'
import { SW_BG, SW_BG_CNAME, SW_ID, SW_CLEAR_CNAME } from '../../constants/general_configs.js'
import { tag } from '../../constants/enums.js'

export default class ColorSwatch {
    constructor(parent, color) {
        this.parent = parent
        this.color = color
        this.format()
        this.initialize()
    }

    setColor = color => this.color = color

    getColor = () => this.color

    format = () => {
        const clear = () => {
            swatchBg.style.background = SW_BG
            clearBtn.classList.remove('show')
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
    }

    initialize = () => document.addEventListener('colorchange', ({ detail: d }) => this.setColor(d.color))
}