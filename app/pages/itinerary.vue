<template>
  <div class="min-h-screen bg-gray-950 text-white font-sans pb-28">

    <!-- ───── Header ───── -->
    <div class="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800/60 px-5 pt-8 pb-6">
      <div class="max-w-2xl mx-auto">

        <!-- Back + Title -->
        <div class="flex items-start gap-4 mb-5">
          <NuxtLink
            to="/"
            class="mt-1 w-10 h-10 flex-shrink-0 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-yellow-400 hover:border-yellow-400/50 transition-all"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
          </NuxtLink>

          <div>
            <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              {{ cityName }} Express
              <span class="text-yellow-400 mx-1">|</span>
              Itinéraire Dynamique
            </h1>
            <p class="text-gray-500 text-sm mt-1">
              Gérez votre voyage de luxe avec l'assistance IA personnalisée.
            </p>
          </div>
        </div>

        <!-- Stats bar -->
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center gap-1.5 text-sm text-gray-400">
            <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-yellow-400" />
            <span>{{ confirmedSteps.length }} étape{{ confirmedSteps.length > 1 ? 's' : '' }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-sm text-gray-400">
            <UIcon name="i-heroicons-building-storefront" class="w-4 h-4 text-orange-400" />
            <span>{{ restaurantSteps.length }} restaurant{{ restaurantSteps.length > 1 ? 's' : '' }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-sm text-gray-400">
            <UIcon name="i-heroicons-clock" class="w-4 h-4 text-yellow-400" />
            <span>~{{ confirmedSteps.length * 2 }}h de visite</span>
          </div>
          <div class="flex items-center gap-1.5 text-sm text-gray-400">
            <UIcon name="i-heroicons-banknotes" class="w-4 h-4 text-yellow-400" />
            <span>{{ budgetLabel }}</span>
          </div>
        </div>

      </div>
    </div>

    <!-- ───── Timeline ───── -->
    <div class="max-w-2xl mx-auto px-5 pt-8">
      <div class="relative">

        <!-- Vertical line -->
        <div class="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-400/60 via-gray-700/40 to-transparent pointer-events-none" />

        <!-- Steps -->
        <div class="flex flex-col gap-0">
          <template v-for="(step, index) in allSteps" :key="step.id">

            <ItineraryStep
              :step="step"
              class="mb-3"
              @remove="removeStep"
              @confirm="confirmStep"
              @replace="replaceStep"
              @details="openDetails"
            />

            <!-- Add step button between confirmed stops -->
            <div
              v-if="step.status === 'confirmed'"
              class="flex justify-center py-1 pl-14 mb-3"
            >
              <button
                class="flex items-center gap-1.5 border border-dashed border-gray-700 hover:border-yellow-400/50 text-gray-600 hover:text-yellow-400 text-xs font-semibold px-4 py-2 rounded-full transition-all"
                @click="openAddStep(index)"
              >
                <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5" />
                Ajouter une étape
              </button>
            </div>

          </template>

          <!-- Final add -->
          <div class="flex justify-center py-2 pl-14 mt-1">
            <button
              class="flex items-center gap-1.5 border border-dashed border-gray-700 hover:border-yellow-400/50 text-gray-600 hover:text-yellow-400 text-xs font-semibold px-4 py-2 rounded-full transition-all"
              @click="openAddStep(allSteps.length)"
            >
              <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5" />
              Ajouter une étape
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ───── Fixed bottom bar ───── -->
    <div class="fixed bottom-0 left-0 right-0 z-50">
      <div class="bg-gradient-to-t from-gray-950 via-gray-950/95 to-transparent pt-6 pb-5 px-5">
        <div class="max-w-2xl mx-auto flex gap-3">
          <button
            class="flex-1 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-black font-black text-sm py-3.5 rounded-2xl transition-all disabled:opacity-60"
            :disabled="loadingSuggestion"
            @click="getSuggestions"
          >
            <UIcon
              :name="loadingSuggestion ? 'i-heroicons-arrow-path' : 'i-heroicons-sparkles'"
              class="w-4 h-4"
              :class="{ 'animate-spin': loadingSuggestion }"
            />
            {{ loadingSuggestion ? 'Génération…' : 'Obtenir suggestions IA' }}
          </button>
          <button
            class="flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500 hover:bg-gray-800 active:scale-[0.98] text-gray-300 font-semibold text-sm px-5 py-3.5 rounded-2xl transition-all"
          >
            <UIcon name="i-heroicons-share" class="w-4 h-4" />
            Partager
          </button>
        </div>
      </div>
    </div>

    <!-- ───── Details Modal ───── -->
    <UModal v-model="isDetailsOpen">
      <div v-if="selectedStep" class="bg-gray-900 rounded-2xl overflow-hidden">
        <!-- Modal header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h3 class="text-lg font-bold text-white">{{ selectedStep.name }}</h3>
          <button
            class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
            @click="isDetailsOpen = false"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <!-- Modal body -->
        <div class="p-5 flex flex-col gap-4">
          <div v-if="selectedStep.mapUrl" class="w-full h-36 rounded-xl overflow-hidden bg-gray-800">
            <img :src="selectedStep.mapUrl" alt="Carte" class="w-full h-full object-cover" />
          </div>

          <p class="text-sm text-gray-400 italic leading-relaxed">{{ selectedStep.description }}</p>

          <div class="flex flex-col gap-2.5">
            <div class="flex items-center gap-2.5 text-sm text-gray-300">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span>{{ selectedStep.time }}</span>
            </div>
            <div v-if="selectedStep.duration" class="flex items-center gap-2.5 text-sm text-gray-300">
              <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span>Durée estimée : {{ selectedStep.duration }}</span>
            </div>
            <div v-if="selectedStep.price" class="flex items-center gap-2.5 text-sm text-gray-300">
              <UIcon name="i-heroicons-banknotes" class="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span>{{ selectedStep.price }}</span>
            </div>
          </div>
        </div>

        <!-- Modal footer -->
        <div class="px-5 pb-5">
          <a
            :href="`https://maps.google.com/?q=${encodeURIComponent((selectedStep.name || '') + ' ' + cityName)}`"
            target="_blank"
            class="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-black font-bold text-sm py-3.5 rounded-xl transition-all"
          >
            <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
            Ouvrir dans Google Maps
          </a>
        </div>
      </div>
    </UModal>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  city:           { type: String, default: 'Paris' },
  budget:         { type: String, default: 'medium' },
  restaurantType: { type: String, default: 'french' }
})

const cityName = computed(() => props.city || 'Paris')

const budgetLabel = computed(() => ({
  low:    'Budget modéré',
  medium: 'Budget moyen',
  high:   'Budget premium'
}[props.budget] || 'Budget moyen'))

// ─── State ───────────────────────────────────────────────────────
const loadingSuggestion = ref(false)
const isDetailsOpen     = ref(false)
const selectedStep      = ref(null)

const steps = ref([
  {
    id: 1,
    status: 'confirmed',
    type: 'attraction',
    time: '10h00',
    name: 'Tour Eiffel',
    description: "Vivez l'élégance parisienne au sommet du monument emblématique.",
    mapUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/320px-Camponotus_flavomarginatus_ant.jpg',
    duration: '2h',
    price: '26 € / personne',
    premium: false
  },
  {
    id: 2,
    status: 'suggestion',
    type: 'restaurant',
    time: '12h30',
    name: 'Croisière sur la Seine',
    description: "L'IA suggère un déjeuner panoramique sur l'eau après votre visite.",
    mapUrl: null,
    duration: '1h30',
    price: 'À partir de 55 €',
    premium: true
  },
  {
    id: 3,
    status: 'confirmed',
    type: 'attraction',
    time: '14h30',
    name: 'Musée du Louvre',
    description: "Explorez les chefs-d'œuvre les plus célèbres de l'humanité.",
    mapUrl: null,
    duration: '3h',
    price: '17 € / personne',
    premium: false
  },
  {
    id: 4,
    status: 'suggestion',
    type: 'restaurant',
    time: '18h00',
    name: 'Le Marais Bistrot',
    description: "L'IA recommande une pause gastronomique dans le quartier historique du Marais.",
    mapUrl: null,
    duration: '1h30',
    price: 'Environ 35 €',
    premium: false
  }
])

// ─── Computed ────────────────────────────────────────────────────
const allSteps        = computed(() => steps.value)
const confirmedSteps  = computed(() => steps.value.filter(s => s.status === 'confirmed'))
const restaurantSteps = computed(() => steps.value.filter(s => s.type === 'restaurant'))

// ─── Actions ─────────────────────────────────────────────────────
function removeStep(id) {
  steps.value = steps.value.filter(s => s.id !== id)
}

function confirmStep(id) {
  const step = steps.value.find(s => s.id === id)
  if (step) step.status = 'confirmed'
}

function replaceStep(id) {
  // TODO: call AI API to get a replacement suggestion
  const step = steps.value.find(s => s.id === id)
  if (step) {
    step.name        = 'Nouvelle suggestion en cours…'
    step.description = "L'IA génère une nouvelle suggestion pour vous."
  }
}

function openDetails(step) {
  selectedStep.value = step
  isDetailsOpen.value = true
}

function openAddStep(afterIndex) {
  // TODO: open a modal or side panel to insert a custom step
  console.log('Add step after index:', afterIndex)
}

async function getSuggestions() {
  loadingSuggestion.value = true
  // TODO: replace with your real AI API call
  await new Promise(r => setTimeout(r, 1500))
  steps.value.push({
    id: Date.now(),
    status: 'suggestion',
    type: 'attraction',
    time: '20h00',
    name: 'Montmartre & Sacré-Cœur',
    description: "L'IA suggère une promenade nocturne dans le quartier des artistes.",
    mapUrl: null,
    duration: '2h',
    price: 'Gratuit',
    premium: false
  })
  loadingSuggestion.value = false
}
</script>