import type { Position } from "./coordinates.types"

export type ColorsForMarker = "blue" | "red"

export interface MarkerType {
    name: string
    colorIcon: ColorsForMarker
    position: Position
}