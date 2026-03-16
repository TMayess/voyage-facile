export interface Destination {
    id: number
    created_at: string

    name: string | null
    population: number | null
    currency: string | null
    timezone: string | null
    country: string | null
    language: string | null

    cover_image_url: string | null
    short_description: string | null
    city_slug: string | null
}

export type DestinationInsert = Omit<
    Destination,
    'id' | 'created_at'
>

export type DestinationUpdate = Partial<DestinationInsert>