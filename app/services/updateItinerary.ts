import type { ItineraryModel, ItineraryStep } from '~/types/itinerary'

// Update entire itinerary
export const updateItinerary = async (id: string, itinerary: Partial<ItineraryModel>) => {
    const supabase = useSupabaseClient()

    const { data, error } = await supabase
        .from('itineraries')
        .update({
            name: itinerary.name,
            description: itinerary.description,
            affordability: itinerary.affordability,
            steps: itinerary.steps,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

// Remove a step from itinerary
export const removeStep = async (itineraryId: string, stepIndex: number, steps: ItineraryStep[]) => {
    const updatedSteps = steps.filter((_, index) => index !== stepIndex)
    return updateItinerary(itineraryId, { steps: updatedSteps })
}

// Add a step to itinerary
export const addStep = async (itineraryId: string, newStep: ItineraryStep, steps: ItineraryStep[]) => {
    const updatedSteps = [...steps, newStep]
    return updateItinerary(itineraryId, { steps: updatedSteps })
}

// Update a specific step
export const updateStep = async (itineraryId: string, stepIndex: number, updatedStep: ItineraryStep, steps: ItineraryStep[]) => {
    const updatedSteps = [...steps]
    updatedSteps[stepIndex] = updatedStep
    return updateItinerary(itineraryId, { steps: updatedSteps })
}
