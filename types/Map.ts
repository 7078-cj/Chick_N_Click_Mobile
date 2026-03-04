

export type coordinate = {
    lat:number | null
    lng:number | null
    full?: string 
    city?: string
    country?: string
}

export type route = {
    start: coordinate
    end: coordinate | null
    setRouteCoords: React.Dispatch<React.SetStateAction<any[]>>
}