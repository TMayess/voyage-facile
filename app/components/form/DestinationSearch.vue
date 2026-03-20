<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import type { ItineraryStyle } from '~/types/itinerary'
import { useAutocomplete, type Destination } from '~/services/autocomplete'

const props = defineProps<{
  modelValue: string
  iteraryStyle: ItineraryStyle
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'select': [destination: Destination]
}>()

const { suggestions, loading: loadingSuggestions, search, clear } = useAutocomplete()

const showDropdown     = ref(false)
const showAISuggestions = ref(false)
const showAIQuestions  = ref(false)
const container        = ref(null)

const loadingAISuggestions = ref(false)
const aiSuggestions        = ref<Destination[]>([])
const aiErrorMsg           = ref('')

const aiTravelInterest = ref('')
const aiClimate        = ref('')
const aiCityType       = ref('')

const travelInterestOptions = [
  { label: 'Aventure',           value: 'adventure'  },
  { label: 'Culture & Histoire', value: 'culture'    },
  { label: 'Gastronomie',        value: 'food'       },
  { label: 'Détente',            value: 'relaxation' },
  { label: 'Nature & Plein Air', value: 'nature'     },
  { label: 'Vie Nocturne',       value: 'nightlife'  },
  { label: 'Shopping',           value: 'shopping'   },
]

const climateOptions = [
  { label: 'Tropical',          value: 'tropical'  },
  { label: 'Tempéré',           value: 'temperate' },
  { label: 'Froid',             value: 'cold'      },
  { label: 'Désert',            value: 'desert'    },
  { label: 'Mixte/Indifférent', value: 'any'       },
]

const cityTypeOptions = [
  { label: 'Ville Balnéaire',   value: 'beach'       },
  { label: 'Montagne',          value: 'mountain'    },
  { label: 'Métropole Urbaine', value: 'urban'       },
  { label: 'Ville Historique',  value: 'historic'    },
  { label: 'Ville Moderne',     value: 'modern'      },
  { label: 'Campagne',          value: 'countryside' },
]

onClickOutside(container, () => {
  showDropdown.value = false
  showAISuggestions.value = false
})

function onInput() {
  showDropdown.value = true
  emit('select', null as any)
  search(props.modelValue)
}

function selectCity(city: Destination) {
  emit('update:modelValue', city.label)
  emit('select', city)
  showDropdown.value = false
  clear()
}

function openAIQuestions() {
  showAIQuestions.value = true
  aiTravelInterest.value = ''
  aiClimate.value = ''
  aiCityType.value = ''
  aiErrorMsg.value = ''
  aiSuggestions.value = []
}

async function fetchAISuggestions() {
  if (!aiTravelInterest.value || !aiClimate.value || !aiCityType.value) {
    aiErrorMsg.value = 'Veuillez répondre à toutes les questions.'
    return
  }
  loadingAISuggestions.value = true
  aiErrorMsg.value = ''
  aiSuggestions.value = []
  showAIQuestions.value = false
  showAISuggestions.value = true
  try {
    const destinations = await $fetch<Destination[]>('/api/ai-suggest', {
      method: 'POST',
      body: {
        travelInterest: aiTravelInterest.value,
        climate:        aiClimate.value,
        cityType:       aiCityType.value,
        style:          props.iteraryStyle || 'Urbanist',
      },
    })
    aiSuggestions.value = destinations
    if (aiSuggestions.value.length === 0) {
      aiErrorMsg.value = 'Aucune suggestion disponible. Réessayez !'
    }
  } catch {
    aiErrorMsg.value = 'Erreur lors de la récupération des suggestions IA.'
  } finally {
    loadingAISuggestions.value = false
  }
}

function selectAISuggestion(city: Destination) {
  emit('update:modelValue', city.label)
  emit('select', city)
  showAISuggestions.value = false
  clear()
}
</script>

<template>
  <section ref="container" class="mb-8 relative">
    <div class="flex justify-between items-center mb-4">
      <label class="block text-primary text-xs font-bold tracking-widest uppercase">
        Destination de rêve
      </label>
      <button
        :disabled="loadingAISuggestions"
        class="text-[11px] cursor-pointer font-black text-white bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary-light px-3.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-primary/40 hover:shadow-primary/60 border border-primary-light/50 hover:border-primary-light animate-pulse hover:animate-none"
        @click="openAIQuestions"
      >
        <UIcon name="i-heroicons-sparkles" class="w-4 h-4 animate-bounce" />
        IA
      </button>
    </div>

    <UInput
      :model-value="modelValue"
      icon="i-heroicons-magnifying-glass"
      placeholder="Où voulez-vous aller ?"
      variant="none"
      class="bg-surface-raised rounded-full w-full"
      :ui="{ base: 'h-14 text-gray-300 px-6 focus:ring-1 focus:ring-primary/50' }"
      @update:model-value="$emit('update:modelValue', $event)"
      @input="onInput"
      @focus="showDropdown = true"
    />

    <!-- Autocomplete dropdown -->
    <Transition name="fade">
      <div
        v-if="showDropdown"
        class="absolute z-50 top-full mt-2 w-full bg-surface border border-gray-800 rounded-2xl p-4 shadow-2xl"
      >
        <div v-if="loadingSuggestions" class="flex justify-center py-4">
          <div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <template v-else>
          <p class="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">
            {{ suggestions.length ? 'Destinations trouvées' : 'Tapez une ville...' }}
          </p>
          <div class="space-y-1">
            <button
              v-for="item in suggestions"
              :key="item.label + item.position"
              class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-raised transition-colors group"
              @click="selectCity(item)"
            >
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full overflow-hidden ring-1 ring-gray-700 bg-surface-raised flex items-center justify-center shrink-0">
                  <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
                  <span v-else class="text-primary font-bold text-sm">{{ item.label[0] }}</span>
                </div>
                <div class="text-left">
                  <p class="text-white font-medium text-sm group-hover:text-primary">{{ item.label }}</p>
                  <p class="text-gray-500 text-xs">{{ item.position }}</p>
                </div>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="text-gray-600 w-4 h-4" />
            </button>
          </div>
        </template>
      </div>
    </Transition>

    <!-- AI Questionnaire modal -->
    <Transition name="fade">
      <div
        v-if="showAIQuestions"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="showAIQuestions = false"
      >
        <div class="bg-surface border border-divider rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-primary" />
              Préférences de voyage
            </h2>
            <p class="text-gray-400 text-sm">Répondez à ces questions pour une meilleure recommandation</p>
          </div>

          <div class="mb-6">
            <label class="text-primary text-xs font-bold tracking-widest uppercase mb-3 block">Votre intérêt principal</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="option in travelInterestOptions"
                :key="option.value"
                :class="[
                  'px-3 cursor-pointer py-2 rounded-lg text-xs font-bold uppercase transition-all border text-center',
                  aiTravelInterest === option.value
                    ? 'bg-primary border-primary text-black'
                    : 'bg-surface-raised border-gray-700 text-gray-300 hover:border-primary/50'
                ]"
                @click="aiTravelInterest = option.value"
              >{{ option.label }}</button>
            </div>
          </div>

          <div class="mb-6">
            <label class="text-primary text-xs font-bold tracking-widest uppercase mb-3 block">Préférence climat</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="option in climateOptions"
                :key="option.value"
                :class="[
                  'px-3 cursor-pointer py-2 rounded-lg text-xs font-bold uppercase transition-all border text-center',
                  aiClimate === option.value
                    ? 'bg-primary border-primary text-black'
                    : 'bg-surface-raised border-gray-700 text-gray-300 hover:border-primary/50'
                ]"
                @click="aiClimate = option.value"
              >{{ option.label }}</button>
            </div>
          </div>

          <div class="mb-6">
            <label class="text-primary text-xs font-bold tracking-widest uppercase mb-3 block">Type de ville</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="option in cityTypeOptions"
                :key="option.value"
                :class="[
                  'px-3 cursor-pointer py-2 rounded-lg text-xs font-bold uppercase transition-all border text-center',
                  aiCityType === option.value
                    ? 'bg-primary border-primary text-black'
                    : 'bg-surface-raised border-gray-700 text-gray-300 hover:border-primary/50'
                ]"
                @click="aiCityType = option.value"
              >{{ option.label }}</button>
            </div>
          </div>

          <div v-if="aiErrorMsg" class="text-red-400 text-xs font-medium mb-4 text-center">{{ aiErrorMsg }}</div>

          <div class="flex gap-3">
            <button
              class="flex-1 px-4 py-3 bg-surface-raised hover:bg-gray-800 border border-gray-700 text-gray-300 font-bold text-sm rounded-xl transition-all uppercase"
              @click="showAIQuestions = false"
            >Annuler</button>
            <button
              :disabled="!aiTravelInterest || !aiClimate || !aiCityType"
              class="flex-1 cursor-pointer px-4 py-3 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm rounded-xl transition-all uppercase flex items-center justify-center gap-2"
              @click="fetchAISuggestions"
            >
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
              Chercher
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- AI Suggestions dropdown -->
    <Transition name="fade">
      <div
        v-if="showAISuggestions"
        class="absolute z-50 top-full mt-2 w-full bg-surface border border-primary/30 rounded-2xl p-4 shadow-2xl backdrop-blur-sm"
      >
        <div v-if="loadingAISuggestions" class="flex justify-center py-8">
          <div class="flex flex-col items-center gap-3">
            <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p class="text-[10px] font-bold text-primary uppercase tracking-widest">IA cherche le lieu idéal...</p>
          </div>
        </div>
        <template v-else>
          <div v-if="aiErrorMsg" class="text-red-400 text-xs font-medium mb-3 text-center">{{ aiErrorMsg }}</div>
          <div v-if="aiSuggestions.length > 0" class="space-y-2">
            <p class="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">✨ Suggestions personnalisées</p>
            <button
              v-for="item in aiSuggestions"
              :key="item.label + item.position"
              class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-raised transition-colors group border border-primary/20 hover:border-primary/50"
              @click="selectAISuggestion(item)"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full overflow-hidden ring-1 ring-primary/30 bg-surface-raised flex items-center justify-center shrink-0">
                  <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
                  <span v-else class="text-primary font-bold text-sm">{{ item.label[0] }}</span>
                </div>
                <div class="text-left">
                  <p class="text-white font-semibold text-sm group-hover:text-primary">{{ item.label }}</p>
                  <p class="text-gray-500 text-xs">{{ item.position }}</p>
                </div>
              </div>
              <UIcon name="i-heroicons-check-circle" class="text-primary/60 group-hover:text-primary w-5 h-5" />
            </button>
          </div>
          <div v-else class="text-center py-6">
            <p class="text-gray-500 text-xs">Aucune suggestion trouvée</p>
          </div>
        </template>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
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
