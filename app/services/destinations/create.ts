import type { Destination, DestinationInsert } from '~/types/destination'

export const createDestination = async (payload: DestinationInsert) => {
    const supabase = useSupabaseClient()

    const { data, error } = await supabase
        .from("destinations")
        .insert(payload)
        .select()
        .single()

    if (error) throw error

    return data as Destination
}