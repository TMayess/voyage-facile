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
  created_at?: string
}

export interface FQSCategory {
  id: string
  name: string
  fsq_category_id?: string
}

export type ItineraryStyle = 'Urbanist' | 'Cultural' | 'Attractions' | 'Nature'

export interface FQSPhoto {
  id?: string
  created_at?: string
  prefix: string
  suffix: string
  width?: number
  height?: number
  url_original?: string
  url_500?: string
  url_300?: string
}

export interface FQSPlace {
  fsq_place_id: string
  distance?: number
  website?: string
  longitude?: number
  latitude?: number
  name: string
  categories: FQSCategory[]
  description?: string
  social_media?: {
    facebook_id?: string
    instagram?: string
    twitter?: string
  }
  photos?: FQSPhoto[]
  rating?: number
  price?: Affordability
  location?: {
    address?: string
    locality?: string
    region?: string
    postcode?: string
    country?: string
    formatted_address?: string
  }
}

export type Pace = 'relaxed' | 'balanced' | 'intense'

export type Affordability = 1 | 2 | 3 | 4
