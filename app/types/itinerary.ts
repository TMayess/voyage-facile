
export interface ItineraryStep {
    step: string
    categoryId: string
    startHour: string
    endHour: string
    places?: FQSPlace[]
    meal?: 'Breakfast' | 'Brunch' | 'Lunch' | 'Snack' | 'Dinner'
}

export interface ItineraryModel {
    id: string
    name: string
    userId?: string
    affordability: Affordability
    place: string
    description: string
    category: ItineraryStyle
    steps: ItineraryStep[]
}

export type ItineraryStyle = 'Urbanist' | 'Cultural' | 'Attractions' | 'Nature'

export interface FQSPlace {
    fsq_place_id: string
    distance?: number
    website?: string
    name: string
    description?: string
    photos?: {
        id: string
        created_at: string
        prefix: string
        suffix: string
        width: number
        height: number
    }[]
    rating?: number
    price?: Affordability
    location?: {
        address?: string,
        locality?: string,
        region?: string,
        postcode?: string,
        country?: string,
        formatted_address?: string
    }
}

export type Pace = 'relaxed' | 'balanced' | 'intense'

export type Affordability = 1 | 2 | 3 | 4