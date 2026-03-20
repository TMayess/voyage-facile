<script setup lang="ts">
import type { ItineraryModel, ItineraryStyle, Affordability, Pace } from '~/types/itinerary'
import type { Destination } from '~/services/autocomplete'
import { saveItinerary } from '~/services/saveItinerary'
import { AFFORDABILITY_LABELS } from '~/utils/itinerary'

const user = useSupabaseUser()

const destination         = ref<string>('')
const selectedDestination = ref<Destination | null>(null)
const iteraryStyle        = ref<ItineraryStyle | null>('Urbanist')
const affordability       = ref<Affordability>(2)
const pace                = ref<Pace>('balanced')

const optionsPace = [
  { label: 'Tranquille', value: 'relaxed'  as Pace },
  { label: 'Équilibré',  value: 'balanced' as Pace },
  { label: 'Intensif',   value: 'intense'  as Pace },
]

const optionsItineraryStyle = [
  { label: 'Urbain',      value: 'Urbanist'    as ItineraryStyle },
  { label: 'Culturel',    value: 'Cultural'    as ItineraryStyle },
  { label: 'Attractions', value: 'Attractions' as ItineraryStyle },
  { label: 'Nature',      value: 'Nature'      as ItineraryStyle },
]

const getAffordabilityLabel = (value: Affordability): string =>
  AFFORDABILITY_LABELS[value] || '—'

const loading  = ref(false)
const errorMsg = ref('')

async function genererItinerary() {
  if (!destination.value.trim()) return

  loading.value  = true
  errorMsg.value = ''

  try {
    const data: ItineraryModel = await $fetch(
      `/api/places?near=${encodeURIComponent(destination.value)}&style=${iteraryStyle.value}&affordability=${affordability.value}&pace=${pace.value}`
    )
    const itineraryId = await saveItinerary({ ...data, userId: user.value?.id, affordability: affordability.value })
    navigateTo(`/itinerary?id=${itineraryId}`)
  } catch (err: any) {
    errorMsg.value = err.data?.message || 'Erreur lors de la récupération.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen text-white flex flex-col items-center py-12 px-4 font-sans bg-page">
    <div class="text-center mb-10">
      <h1 class="text-4xl md:text-5xl font-bold mb-2">
        Où commence votre <span class="italic text-primary">aventure</span> ?
      </h1>
      <p class="text-gray-400 text-sm md:text-base max-w-lg mx-auto">
        Personnalisez chaque détail de votre itinéraire de luxe pour une expérience inoubliable.
      </p>
    </div>

    <div class="w-full max-w-2xl bg-surface border border-divider rounded-3xl p-8 md:p-12 shadow-2xl">

      <FormDestinationSearch
        v-model="destination"
        :iterary-style="iteraryStyle || 'Urbanist'"
        @select="selectedDestination = $event"
      />

      <!-- Style d'itinéraire -->
      <section class="mb-8">
        <label class="block text-primary text-xs font-bold tracking-widest uppercase mb-4">
          Style d'itinéraire
        </label>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="item in optionsItineraryStyle"
            :key="item.value"
            :class="[
              'px-6 py-2 rounded-full text-sm transition-all border cursor-pointer',
              iteraryStyle === item.value
                ? 'bg-primary border-primary text-black'
                : 'bg-surface-raised border-transparent text-gray-400 hover:border-primary/50'
            ]"
            @click="iteraryStyle = item.value"
          >{{ item.label }}</button>
        </div>
      </section>

      <!-- Budget -->
      <section class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <label class="text-primary text-xs font-bold tracking-widest uppercase">Budget</label>
          <span class="text-2xl font-bold text-primary">{{ getAffordabilityLabel(affordability) }}</span>
        </div>
        <input
          v-model="affordability"
          type="range"
          min="1"
          max="4"
          step="1"
          class="w-full h-1 bg-surface-raised rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div class="flex justify-between text-[10px] text-gray-500 mt-2 uppercase font-bold">
          <span>€</span>
          <span>€€€€</span>
        </div>
      </section>

      <!-- Rythme -->
      <section class="mb-8">
        <label class="block text-primary text-xs font-bold tracking-widest uppercase mb-4">
          Rythme de voyage
        </label>
        <div class="grid grid-cols-3 bg-surface-raised p-1 rounded-full">
          <button
            v-for="r in optionsPace"
            :key="r.value"
            :class="[
              'py-3 cursor-pointer rounded-full text-xs font-bold uppercase transition-all',
              pace === r.value ? 'bg-primary text-black shadow-lg' : 'text-gray-400'
            ]"
            @click="pace = r.value"
          >{{ r.label }}</button>
        </div>
      </section>

      <!-- Generate button -->
      <div class="flex flex-col items-center gap-4">
        <button
          :disabled="loading || !destination"
          class="w-full py-3 bg-primary cursor-pointer hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-lg rounded-full flex items-center justify-center gap-2 transition-all shadow-xl shadow-yellow-900/20 uppercase"
          @click="genererItinerary"
        >
          <span v-if="loading">Recherche en cours...</span>
          <span v-else>Générer mon itinéraire</span>
          <UIcon name="i-heroicons-sparkles-20-solid" class="w-5 h-5" />
        </button>

        <p v-if="errorMsg" class="text-red-400 text-xs font-medium">{{ errorMsg }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  background: var(--color-primary);
  border: 2px solid var(--color-surface);
  height: 20px;
  width: 20px;
  border-radius: 50%;
  cursor: pointer;
}
</style>
