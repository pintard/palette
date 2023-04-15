import { RGBtoHEX } from "./conversions"

/**
 * Creates and inserts an HTMLElement into a specified DOM Element
 * with the given attributes
 *
 * @param {string} tag the HTML element type given as a string
 * @param {HTMLElement | string} parent the HTMLElement or string of the parent ID to be inserted at
 * @param {Object[]} props a list of HTMLElement attributes in object form
 * @param {Object} styles an object of styles for the created element
 * @returns {HTMLElement | null} the created element
 */
export const createElement = (
    tag: string,
    parent: string | HTMLElement,
    props?: Object[],
    styles?: Object
): HTMLElement | null => {
    const element: HTMLElement = document.createElement(tag)
    const parentElement: HTMLElement | null = isElement(parent) ?
        <HTMLElement>parent :
        document.getElementById(<string>parent)
    if (!parentElement) return null
    props && setElementProps(element, props)
    styles && setElementStyles(element, styles)
    parentElement.appendChild(element)
    return element
}

/**
 * Sets the given element with the list of attributes provided
 *
 * @param {HTMLElement} el an HTMLElement to set the properties of
 * @param {Object[]} props a list of HTMLElement attributes
 * @returns {HTMLElement}
 */
export const setElementProps = (el: HTMLElement, props: Object[]): HTMLElement => Object.assign(el, ...props)

/**
 * Sets the given element with the styles object provided
 *
 * @param {HTMLElement} el an HTMLElement to set the styles of
 * @param {Object} styles an Object with CSS style attributes
 * @returns {CSSStyleDeclaration}
 */
export const setElementStyles = (el: HTMLElement, styles: Object): CSSStyleDeclaration => Object.assign(el.style, styles)

/**
 * Takes any object and determines if it is an HTMLElement
 *
 * @param {any} el any object
 * @returns {boolean} true if given object is an HTMLElement
 */
export const isElement = (el: any): boolean => (el instanceof Element || el instanceof HTMLElement)

export const rgbToStr = ([r, g, b]: number[]): string => `rgb(${r}, ${g}, ${b})`

export const rgbaToStr = ([r, g, b, a]: number[]): string => `rgba(${r}, ${g}, ${b}, ${a})`

export const rgbToHexStr = ([r, g, b]: number[]): string => `#${RGBtoHEX(r, g, b)}`