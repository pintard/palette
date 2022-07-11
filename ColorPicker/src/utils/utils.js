import { RGBtoHEX } from "./conversions.js"

/**
 * Creates and inserts an HTMLElement into a specified DOM Element
 * with the given attributes
 *
 * @param {string} tag the HTML element type given as a string
 * @param {HTMLElement | string} parent the HTMLElement or string of the parent ID to be inserted at
 * @param {Object[]} props a list of HTMLElement attributes in object form
 * @param {Object} styles an object of styles for the created element
 * @returns {HTMLElement} the created element
 */
export const createElement = (tag, parent, props, styles) => {
    const element = document.createElement(tag)
    const parentElement = isElement(parent) ? parent : document.getElementById(parent)
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
 * @returns {void}
 */
export const setElementProps = (el, props) => Object.assign(el, ...props)

/**
 * Sets the given element with the styles object provided
 *
 * @param {HTMLElement} el an HTMLElement to set the styles of
 * @param {Object} styles an Object with CSS style attributes
 * @returns {void}
 */
export const setElementStyles = (el, styles) => Object.assign(el.style, styles)

/**
 * Takes any object and determines if it is an HTMLElement
 *
 * @param {any} el any object
 * @returns {boolean} true if given object is an HTMLElement
 */
export const isElement = el => (el instanceof Element || el instanceof Document)

export const rgbToStr = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`

export const rgbaToStr = ([r, g, b, a]) => `rgba(${r}, ${g}, ${b}, ${a})`

export const rgbToHexStr = color => `#${RGBtoHEX(...color)}`