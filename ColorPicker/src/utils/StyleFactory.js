import { destinations, tag } from "../constants/enums.js"

String.prototype.splitCSS = function () {
    // TODO Handle media queries
    const result = []
    let l = 0, r = 0
    while (r++ < this.length) {
        if (this.charAt(r) === '}') {
            const cssRule = this.slice(l, r + 1)
            result.push(cssRule.trim())
            l = r += 1
        }
    }
    return result
}

export default class StyleFactory {
    static setUp = async procedure => {
        const style = document.createElement(tag.STYLE)
        document.head.appendChild(style)

        await Promise.all(destinations.map(async (destination) =>
            await this.addStyle(destination, style.sheet)))

        procedure.format()
        procedure.init()
    }

    static addStyle = async (directory, sheet) => {
        const url = `/ColorPicker/public/styles/${directory}/styles.css`
        try {
            const response = await fetch(url)
            const css = await response.text()
            const rules = css.replace(/ {4}|[\t\n\r]/gm, '').splitCSS()
            rules.forEach(rule => sheet.insertRule(rule))
        } catch (error) {
            console.error('ERROR: there was an asset request error or a rule insertion error', error)
        }
    }
}