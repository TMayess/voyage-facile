import type { ItineraryStep, Pace, Affordability, ItineraryModel } from "~/types/itinerary"
import { searchPlaces } from "./searchPlaces"

export async function createUrbanistItinerary(
    location: string,
    pace: Pace = 'balanced',
    minPrice: Affordability = 1,
    place: string
) {
    let steps: ItineraryStep[] = [
        { step: 'Balade matinale dans le centre-ville', categoryId: '52e81612bcbc57f1066b7a25', startHour: '08:00', endHour: '09:30' },
        { step: 'Café & brunch dans un café tendance', categoryId: '4bf58dd8d48988d1e0931735', startHour: '09:30', endHour: '10:30', meal: 'Breakfast' },
        { step: 'Découverte de l’architecture moderne', categoryId: '4bf58dd8d48988d1df941735', startHour: '10:30', endHour: '12:00' },
        { step: 'Street art et sculptures', categoryId: '4bf58dd8d48988d166941735', startHour: '12:00', endHour: '13:00' },
        { step: 'Déjeuner dans un bistrot local', categoryId: '4bf58dd8d48988d1e0941735', startHour: '13:00', endHour: '14:00', meal: 'Lunch' },
        { step: 'Restaurant rooftop avec vue', categoryId: '4bf58dd8d48988d133951735', startHour: '17:00', endHour: '18:30', meal: 'Snack' },
        { step: 'Balade en bord de l’eau', categoryId: '56aa371be4b08b9a8d5734c3', startHour: '18:30', endHour: '20:00' },
        { step: 'Dîner dans un restaurant branché', categoryId: '4bf58dd8d48988d1e0941735', startHour: '20:00', endHour: '21:30', meal: 'Dinner' },
    ]

    if (pace === 'relaxed') {
        steps = steps.filter((_, i) => [0, 1, 2, 4, 7].includes(i))
    }

    if (pace === 'intense') {
        steps.splice(4, 0, {
            step: 'Pause café rapide',
            categoryId: '4bf58dd8d48988d1e0931735',
            startHour: '14:00',
            endHour: '14:30',
            meal: 'Snack'
        })
    }

    const itinerary: ItineraryModel = {
        name: 'Urbain',
        place,
        description: 'Explorez la ville, son architecture et ses lieux modernes.',
        category: 'Urbanist',
        steps
    }

    for (const step of itinerary.steps) {
        step['places'] = await searchPlaces(step, location, minPrice)
    }

    return itinerary
}