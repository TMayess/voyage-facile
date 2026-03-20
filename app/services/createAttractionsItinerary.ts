import type { ItineraryStep, Pace, Affordability, ItineraryModel } from "~/types/itinerary"
import { searchPlaces } from "./searchPlaces"

export async function createAttractionsItinerary(location: string, pace: Pace = 'balanced', minPrice: Affordability = 1, place: string): Promise<ItineraryModel> {
    let steps: ItineraryStep[] = [
        { step: 'Visite d’un monument emblématique', categoryId: '4d4b7105d754a06377d81259', startHour: '08:00', endHour: '09:00' },
        { step: 'Place centrale', categoryId: '4bf58dd8d48988d164941735', startHour: '09:00', endHour: '10:00' },
        { step: 'Attraction populaire / musée', categoryId: '4bf58dd8d48988d181941735', startHour: '10:00', endHour: '12:00' },
        { step: 'Déjeuner', categoryId: '4bf58dd8d48988d1e0941735', startHour: '12:00', endHour: '13:00', meal: 'Lunch' },
        { step: 'Point de vue panoramique', categoryId: '4bf58dd8d48988d165941735', startHour: '13:00', endHour: '14:00' },
        { step: 'Activité ludique', categoryId: '4bf58dd8d48988d1e7941735', startHour: '14:00', endHour: '15:30' },
        { step: 'Dîner', categoryId: '4bf58dd8d48988d1e0941735', startHour: '19:00', endHour: '20:30', meal: 'Dinner' },
    ]

    if (pace === 'relaxed') {
        steps = steps.filter((_, i) => [0, 2, 3, 6].includes(i))
    }

    if (pace === 'intense') {
        steps.push({
            step: 'Balade nocturne',
            categoryId: '56aa371be4b08b9a8d5734c3',
            startHour: '21:00',
            endHour: '22:30'
        })
    }

    for (const step of steps) {
        step['places'] = await searchPlaces(step, location, minPrice)
    }

    const itinerary: ItineraryModel = {
        name: 'Attractions',
        place,
        description: 'Explorez les lieux incontournables de la ville.',
        category: 'Attractions',
        steps
    }

    return itinerary
}