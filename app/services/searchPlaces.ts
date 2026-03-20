// services/searchPlaces.ts
import type { ItineraryStep, Affordability } from "~/types/itinerary"

const FSQ_BASE_URL = 'https://places-api.foursquare.com/places/search'

export async function searchPlaces(
    step: ItineraryStep,
    location: string,
    _minPrice: Affordability = 2,
    limit = 4
) {
    const params = new URLSearchParams({
        near: location,
        fsq_category_ids: step.categoryId,
        limit: limit.toString(),
        sort: 'RATING',
        fields: 'fsq_place_id,name,social_media,location,distance,website,description,photos,rating,price,latitude,longitude',
    })

    const res = await fetch(`${FSQ_BASE_URL}?${params.toString()}`, {
        headers: {
            'Authorization': `Bearer ${process.env.FOURSQUARE_API_KEY}`,
            'Accept': 'application/json',
            'X-Places-Api-Version': '2025-06-17',
        },
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Foursquare API error: ${err}`)
    }

    const data = await res.json()
    return data.results
}