import type { ItineraryModel, ItineraryStep } from '~/types/itinerary'

// Update entire itinerary — only sends defined fields to avoid overwriting with null
export const updateItinerary = async (id: string, itinerary: Partial<ItineraryModel>) => {
    const supabase = useSupabaseClient()

    const fields: Record<string, any> = { updated_at: new Date().toISOString() }
    if (itinerary.name        !== undefined) fields.name         = itinerary.name
    if (itinerary.description !== undefined) fields.description  = itinerary.description
    if (itinerary.affordability !== undefined) fields.affordability = itinerary.affordability
    if (itinerary.steps       !== undefined) fields.steps        = itinerary.steps

    const { data, error } = await supabase
        .from('itineraries')
        .update(fields)
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
