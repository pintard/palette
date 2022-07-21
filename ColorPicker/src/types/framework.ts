import { EventType } from "../constants/enums"

export type Color = [number, number, number]

export type Coords = [number, number]

export type Coord = number

export interface EventDetail {
    color: Color,
    changing?: number,
    type: EventType,
    target: HTMLElement
}

export interface ColorEvent extends CustomEvent {
    detail: EventDetail
}

declare global {
    interface DocumentEventMap {
        'colorchange': ColorEvent
    }
}