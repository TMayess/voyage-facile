import type { Destination } from '~/types/destination'

export const getAllDestinations = async (): Promise<Destination[]> => {
    const supabase = useSupabaseClient()

    const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('name')

    if (error) throw error

    return data as Destination[]
}