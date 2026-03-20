<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import type { ItineraryModel, ItineraryStyle, Affordability, Pace } from '~/types/itinerary'
import { useAutocomplete, type Destination } from '~/services/autocomplete'
import { saveItinerary } from '~/services/saveItinerary'
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey: "AIzaSyAE2jm_U6WUTY6rGqLDC2BxxKqc4OCyiXY"});

async function suggestCity(
  travelInterest: string,
  climate: string,
  cityType: string,
  style: string,
  affordability: number,
  pace: string
): Promise<Destination[]> {
  try {
    
    const prompt = `You are a travel recommendation expert. Based on these preferences, suggest exactly 3 cities (no more, no less) in JSON format.
    
User Preferences:
- Travel Interest: ${travelInterest}
- Climate: ${climate}
- City Type: ${cityType}
- Itinerary Style: ${style}

Return ONLY a valid JSON response in this exact format, with no additional text:
{
  "destinations": [
    {"label": "City Name", "position": "Country"},
    {"label": "City Name", "position": "Country"},
    {"label": "City Name", "position": "Country"}
  ]
}`

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    })
    
    const responseText = response.text || ''
    
    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Impossible de parser la réponse')
    }
    
    const result = JSON.parse(jsonMatch[0])
    return result.destinations || []
  } catch (error) {
    console.error('Erreur lors de la suggestion de ville:', error)
    throw error
  }
}

// --- AUTOCOMPLÉTION ---
const { suggestions, loading: loadingSuggestions, search, clear } = useAutocomplete()
const user = useSupabaseUser()

// --- ÉTATS DU FORMULAIRE ---
const destination = ref<string>('')
const selectedDestination = ref<Destination | null>(null)
const iteraryStyle = ref<ItineraryStyle | null>('Urbanist')
const affordability = ref<Affordability>(2)
const pace = ref<Pace>('balanced')

const optionsPace = [
  { label: 'Tranquille', value: 'slow' },
  { label: 'Équilibré', value: 'balanced' },
  { label: 'Intensif', value: 'fast' }
]
const optionsItineraryStyle = [
  { label: 'Urbain', value: 'Urbanist' },
  { label: 'Culturel', value: 'Cultural' },
  { label: 'Attractions', value: 'Attractions' },
  { label: 'Nature', value: 'Nature' }
]

const affordabilityLabels: Record<number, string> = {
  1: 'Low budget',
  2: 'Budget',
  3: 'Comfortable',
  4: 'Luxury'
}

const getAffordabilityLabel = (value: Affordability): string => {
  return affordabilityLabels[value] || '—'
}

// --- API ---
const loading = ref(false)
const itinerary = ref<ItineraryModel | null>(null)
const errorMsg = ref('')

// --- AI SUGGESTIONS ---
const loadingAISuggestions = ref(false)
const aiSuggestions = ref<Destination[]>([])
const showAISuggestions = ref(false)
const aiErrorMsg = ref('')

// AI Questionnaire State
const showAIQuestions = ref(false)
const aiTravelInterest = ref<string>('')
const aiClimate = ref<string>('')
const aiCityType = ref<string>('')

const travelInterestOptions = [
  { label: 'Aventure', value: 'adventure' },
  { label: 'Culture & Histoire', value: 'culture' },
  { label: 'Gastronomie', value: 'food' },
  { label: 'Détente', value: 'relaxation' },
  { label: 'Nature & Plein Air', value: 'nature' },
  { label: 'Vie Nocturne', value: 'nightlife' },
  { label: 'Shopping', value: 'shopping' }
]

const climateOptions = [
  { label: 'Tropical', value: 'tropical' },
  { label: 'Tempéré', value: 'temperate' },
  { label: 'Froid', value: 'cold' },
  { label: 'Désert', value: 'desert' },
  { label: 'Mixte/Indifférent', value: 'any' }
]

const cityTypeOptions = [
  { label: 'Ville Balnéaire', value: 'beach' },
  { label: 'Montagne', value: 'mountain' },
  { label: 'Métropole Urbaine', value: 'urban' },
  { label: 'Ville Historique', value: 'historic' },
  { label: 'Ville Moderne', value: 'modern' },
  { label: 'Campagne', value: 'countryside' }
]

// --- DROPDOWN ---
const showDropdown = ref(false)
const container = ref(null)

const onInput = () => {
  showDropdown.value = true
  selectedDestination.value = null
  search(destination.value)
}

const selectCity = (city: Destination) => {
  destination.value = city.label
  selectedDestination.value = city
  showDropdown.value = false
  clear()
}

onClickOutside(container, () => {
  showDropdown.value = false
  showAISuggestions.value = false
})

// --- OPEN AI QUESTIONNAIRE ---
function openAIQuestions() {
  showAIQuestions.value = true
  aiTravelInterest.value = ''
  aiClimate.value = ''
  aiCityType.value = ''
  aiErrorMsg.value = ''
  aiSuggestions.value = []
}

function closeAIQuestions() {
  showAIQuestions.value = false
}

// --- AI SUGGESTIONS ACTION ---
async function fetchAISuggestions() {
  if (!aiTravelInterest.value || !aiClimate.value || !aiCityType.value) {
    aiErrorMsg.value = 'Veuillez répondre à toutes les questions.'
    return
  }

  loadingAISuggestions.value = true
  aiErrorMsg.value = ''
  aiSuggestions.value = []
  closeAIQuestions()
  showAISuggestions.value = true

  try {
    // Use the suggestCity function with Google GenAI
    const suggestions = await suggestCity(
      aiTravelInterest.value,
      aiClimate.value,
      aiCityType.value,
      iteraryStyle.value || 'Urbanist',
      affordability.value,
      pace.value
    )
    
    aiSuggestions.value = suggestions
    
    if (aiSuggestions.value.length === 0) {
      aiErrorMsg.value = 'Aucune suggestion disponible. Réessayez!'
    }
  } catch (err: any) {
    console.error('Erreur des suggestions IA:', err)
    aiErrorMsg.value = 'Erreur lors de la récupération des suggestions IA. Veuillez réessayer.'
  } finally {
    loadingAISuggestions.value = false
  }
}

const selectAISuggestion = (city: Destination) => {
  destination.value = city.label
  selectedDestination.value = city
  showAISuggestions.value = false
  clear()
}

// --- ACTION ---
async function genererItinerary() {
  if (!destination.value.trim()) return

  loading.value = true
  errorMsg.value = ''
  itinerary.value = null

  try {
    const data: ItineraryModel = await $fetch(
      `/api/places?near=${encodeURIComponent(destination.value)}&style=${iteraryStyle.value}&affordability=${affordability.value}&pace=${pace.value}`
    )
    itinerary.value = data
    const itineraryId = await saveItinerary({ ...data, userId: user.value?.id, affordability: affordability.value })
    //redirect to itinerary page
    navigateTo(`/itinerary?id=${itineraryId}`)
  } catch (err: any) {
    console.error(err)
    errorMsg.value = err.data?.message || "Erreur lors de la récupération."
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <div class="min-h-screen text-white flex flex-col items-center py-12 px-4 font-sans bg-[#0F0F0A]">
    <div class="text-center mb-10">
      <h1 class="text-4xl md:text-5xl font-bold mb-2">
        Où commence votre <span class="italic text-[#D9B54A]">aventure</span> ?
      </h1>
      <p class="text-gray-400 text-sm md:text-base max-w-lg mx-auto">
        Personnalisez chaque détail de votre itinéraire de luxe pour une expérience inoubliable.
      </p>
    </div>

    <div class="w-full max-w-2xl bg-[#1A1A14] border border-[#2A2A20] rounded-3xl p-8 md:p-12 shadow-2xl">

      <!-- DESTINATION -->
      <section ref="container" class="mb-8 relative">
        <div class="flex justify-between items-center mb-4">
          <label class="block text-[#D9B54A] text-xs font-bold tracking-widest uppercase">
            Destination de rêve
          </label>
          <button
            @click="openAIQuestions"
            :disabled="loadingAISuggestions"
            class="text-[11px] cursor-pointer font-black text-white bg-gradient-to-r from-[#D9B54A] to-[#E8C947] hover:from-[#E8C947] hover:to-[#F0D157] px-3.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-[#D9B54A]/40 hover:shadow-[#D9B54A]/60 border border-[#F0D157]/50 hover:border-[#F0D157] animate-pulse hover:animate-none"
          >
            <UIcon name="i-heroicons-sparkles" class="w-4 h-4 animate-bounce" />
            IA
          </button>
        </div>

        <UInput
          v-model="destination"
          icon="i-heroicons-magnifying-glass"
          placeholder="Où voulez-vous aller ?"
          variant="none"
          class="bg-[#2A2A24] rounded-full w-full"
          :ui="{ base: 'h-14 text-gray-300 px-6 focus:ring-1 focus:ring-[#D9B54A]/50' }"
          @input="onInput"
          @focus="showDropdown = true"
        />

        <Transition name="fade">
          <div
            v-if="showDropdown"
            class="absolute z-50 top-full mt-2 w-full bg-[#1A1A17] border border-gray-800 rounded-2xl p-4 shadow-2xl"
          >
            <div v-if="loadingSuggestions" class="flex justify-center py-4">
              <div class="w-5 h-5 border-2 border-[#D9B54A] border-t-transparent rounded-full animate-spin" />
            </div>

            <template v-else>
              <p class="text-[10px] font-bold text-[#D9B54A] uppercase tracking-widest mb-4">
                {{ suggestions.length ? 'Destinations trouvées' : 'Tapez une ville...' }}
              </p>

              <div class="space-y-1">
                <button
                  v-for="item in suggestions"
                  :key="item.label + item.position"
                  class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#2A2A24] transition-colors group"
                  @click="selectCity(item)"
                >
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full overflow-hidden ring-1 ring-gray-700 bg-[#2A2A24] flex items-center justify-center shrink-0">
                      <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
                      <span v-else class="text-[#D9B54A] font-bold text-sm">{{ item.label[0] }}</span>
                    </div>
                    <div class="text-left">
                      <p class="text-white font-medium text-sm group-hover:text-[#D9B54A]">{{ item.label }}</p>
                      <p class="text-gray-500 text-xs">{{ item.position }}</p>
                    </div>
                  </div>
                  <UIcon name="i-heroicons-chevron-right" class="text-gray-600 w-4 h-4" />
                </button>
              </div>
            </template>
          </div>
        </Transition>

        <!-- AI QUESTIONNAIRE MODAL -->
        <Transition name="fade">
          <div
            v-if="showAIQuestions"
            class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            @click.self="closeAIQuestions"
          >
            <div class="bg-[#1A1A14] border border-[#2A2A20] rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <!-- Header -->
              <div class="mb-6">
                <h2 class="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-[#D9B54A]" />
                  Préférences de voyage
                </h2>
                <p class="text-gray-400 text-sm">Répondez à ces questions pour une meilleure recommandation</p>
              </div>

              <!-- Question 1: Travel Interest -->
              <div class="mb-6">
                <label class="text-[#D9B54A] text-xs font-bold tracking-widest uppercase mb-3 block">Votre intérêt principal</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="option in travelInterestOptions"
                    :key="option.value"
                    @click="aiTravelInterest = option.value"
                    :class="[
                      'px-3 cursor-pointer py-2 rounded-lg text-xs font-bold uppercase transition-all border text-center',
                      aiTravelInterest === option.value
                        ? 'bg-[#D9B54A] border-[#D9B54A] text-black'
                        : 'bg-[#2A2A24] border-gray-700 text-gray-300 hover:border-[#D9B54A]/50'
                    ]"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <!-- Question 2: Climate Preference -->
              <div class="mb-6">
                <label class="text-[#D9B54A] text-xs font-bold tracking-widest uppercase mb-3 block">Préférence climat</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="option in climateOptions"
                    :key="option.value"
                    @click="aiClimate = option.value"
                    :class="[
                      'px-3 cursor-pointer py-2 rounded-lg text-xs font-bold uppercase transition-all border text-center',
                      aiClimate === option.value
                        ? 'bg-[#D9B54A] border-[#D9B54A] text-black'
                        : 'bg-[#2A2A24] border-gray-700 text-gray-300 hover:border-[#D9B54A]/50'
                    ]"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <!-- Question 3: City Type -->
              <div class="mb-6">
                <label class="text-[#D9B54A] text-xs font-bold tracking-widest uppercase mb-3 block">Type de ville</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="option in cityTypeOptions"
                    :key="option.value"
                    @click="aiCityType = option.value"
                    :class="[
                      'px-3 cursor-pointer py-2 rounded-lg text-xs font-bold uppercase transition-all border text-center',
                      aiCityType === option.value
                        ? 'bg-[#D9B54A] border-[#D9B54A] text-black'
                        : 'bg-[#2A2A24] border-gray-700 text-gray-300 hover:border-[#D9B54A]/50'
                    ]"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <!-- Error message -->
              <div v-if="aiErrorMsg" class="text-red-400 text-xs font-medium mb-4 text-center">
                {{ aiErrorMsg }}
              </div>

              <!-- Buttons -->
              <div class="flex gap-3">
                <button
                  @click="closeAIQuestions"
                  class="flex-1 px-4 py-3 bg-[#2A2A24] hover:bg-[#333328] border border-gray-700 text-gray-300 font-bold text-sm rounded-xl transition-all uppercase"
                >
                  Annuler
                </button>
                <button
                  @click="fetchAISuggestions"
                  :disabled="!aiTravelInterest || !aiClimate || !aiCityType"
                  class="flex-1 cursor-pointer px-4 py-3 bg-[#D9B54A] hover:bg-[#C4A342] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm rounded-xl transition-all uppercase flex items-center justify-center gap-2"
                >
                  <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
                  Chercher
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- AI SUGGESTIONS MODAL -->
        <Transition name="fade">
          <div
            v-if="showAISuggestions"
            class="absolute z-50 top-full mt-2 w-full bg-[#1A1A17] border border-[#D9B54A]/30 rounded-2xl p-4 shadow-2xl backdrop-blur-sm"
          >
            <div v-if="loadingAISuggestions" class="flex justify-center py-8">
              <div class="flex flex-col items-center gap-3">
                <div class="w-6 h-6 border-2 border-[#D9B54A] border-t-transparent rounded-full animate-spin" />
                <p class="text-[10px] font-bold text-[#D9B54A] uppercase tracking-widest">IA cherche le lieu idéal...</p>
              </div>
            </div>

            <template v-else>
              <div v-if="aiErrorMsg" class="text-red-400 text-xs font-medium mb-3 text-center">
                {{ aiErrorMsg }}
              </div>

              <div v-if="aiSuggestions.length > 0" class="space-y-2">
                <p class="text-[10px] font-bold text-[#D9B54A] uppercase tracking-widest mb-3">
                  ✨ Suggestions personnalisées
                </p>
                <button
                  v-for="item in aiSuggestions"
                  :key="item.label + item.position"
                  class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#2A2A24] transition-colors group border border-[#D9B54A]/20 hover:border-[#D9B54A]/50"
                  @click="selectAISuggestion(item)"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full overflow-hidden ring-1 ring-[#D9B54A]/30 bg-[#2A2A24] flex items-center justify-center shrink-0">
                      <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
                      <span v-else class="text-[#D9B54A] font-bold text-sm">{{ item.label[0] }}</span>
                    </div>
                    <div class="text-left">
                      <p class="text-white font-semibold text-sm group-hover:text-[#D9B54A]">{{ item.label }}</p>
                      <p class="text-gray-500 text-xs">{{ item.position }}</p>
                    </div>
                  </div>
                  <UIcon name="i-heroicons-check-circle" class="text-[#D9B54A]/60 group-hover:text-[#D9B54A] w-5 h-5" />
                </button>
              </div>

              <div v-else class="text-center py-6">
                <p class="text-gray-500 text-xs">Aucune suggestion trouvée</p>
              </div>
            </template>
          </div>
        </Transition>
      </section>

      <!-- ITINERARY STYLE (FIXED) -->
      <section class="mb-8">
        <label class="block text-[#D9B54A] text-xs font-bold tracking-widest uppercase mb-4">
          Style d’itinéraire
        </label>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="item in optionsItineraryStyle"
            :key="item.value"
            @click="iteraryStyle = (item.value as ItineraryStyle)"
            :class="[
              'px-6 py-2 rounded-full text-sm transition-all border cursor-pointer',
              iteraryStyle === item.value
                ? 'bg-[#D9B54A] border-[#D9B54A] text-black'
                : 'bg-[#2A2A24] border-transparent text-gray-400 hover:border-[#D9B54A]/50'
            ]"
          >
            {{ item.label }}
          </button>
        </div>
      </section>

      <!-- BUDGET (AFFORDABILITY FIX) -->
      <section class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <label class="text-[#D9B54A] text-xs font-bold tracking-widest uppercase">
            Budget
          </label>
          <span class="text-2xl font-bold text-[#D9B54A]">
            {{ getAffordabilityLabel(affordability) }}
          </span>
        </div>

        <input
          v-model="affordability"
          type="range"
          min="1"
          max="4"
          step="1"
          class="w-full h-1 bg-[#2A2A24] rounded-lg appearance-none cursor-pointer accent-[#D9B54A]"
        />

        <div class="flex justify-between text-[10px] text-gray-500 mt-2 uppercase font-bold">
          <span>€</span>
          <span>€€€€</span>
        </div>
      </section>

      <!-- PACE (FIXED) -->
      <section class="mb-8">
        <label class="block text-[#D9B54A] text-xs font-bold tracking-widest uppercase mb-4">
          Rythme de voyage
        </label>
        <div class="grid grid-cols-3 bg-[#2A2A24] p-1 rounded-full">
          <button
            v-for="r in optionsPace"
            :key="r.value"
            @click="pace = (r.value as Pace)"
            :class="[
              'py-3 cursor-pointer rounded-full text-xs font-bold uppercase transition-all',
              pace === r.value ? 'bg-[#D9B54A] text-black shadow-lg' : 'text-gray-400'
            ]"
          >
            {{ r.label }}
          </button>
        </div>
      </section>

      <!-- BTN -->
      <div class="flex flex-col items-center gap-4">
        <button
          @click="genererItinerary"
          :disabled="loading || !destination"
          class="w-full py-3 bg-[#D9B54A] cursor-pointer hover:bg-[#C4A342] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-lg rounded-full flex items-center justify-center gap-2 transition-all shadow-xl shadow-yellow-900/20 uppercase"
        >
          <span v-if="loading">Recherche en cours...</span>
          <span v-else>Générer mon itinéraire</span>
          <UIcon name="i-heroicons-sparkles-20-solid" class="w-5 h-5" />
        </button>

        <p v-if="errorMsg" class="text-red-400 text-xs font-medium">
          {{ errorMsg }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  background: #D9B54A;
  border: 2px solid #1A1A14;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  cursor: pointer;
}

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>