import { destinations, Tag } from "../constants/enums"

String.prototype.splitCSS = function (): string[] {
    // TODO Handle media queries
    const result: string[] = []
    let l: number = 0, r: number = 0
    while (r++ < this.length) {
        if (this.charAt(r) === '}') {
            const cssRule: string = this.slice(l, r + 1)
            result.push(cssRule.trim())
            l = r += 1
        }
    }
    return result
}

export default class StyleFactory {
    static setUp = async (procedure: { format: () => void, init: () => void }): Promise<void> => {
        const style: HTMLStyleElement = document.createElement(Tag.STYLE)
        document.head.appendChild(style)

        await Promise.all(destinations.map((destination: string) =>
            this.addStyle(destination, <CSSStyleSheet>style.sheet)))
        
        procedure.format()
        procedure.init()
    }

    static addStyle = async (directory: string, sheet: CSSStyleSheet): Promise<void> => {
        const url: string = `/ColorPicker/styles/${directory}/styles.css`
        try {
            const response: Response = await fetch(url)
            const css: string = await response.text()
            const rules: string[] = css.replace(/ {4}|[\t\n\r]/gm, '').splitCSS()
            rules.forEach((rule: string) => sheet.insertRule(rule))
        } catch (error) {
            console.error('ERROR: there was an asset request error or a rule insertion error', error)
        }
    }
}