<script setup lang="ts">
// --- ÉTATS DU FORMULAIRE ---
const destination = ref('')
const pointsInteret = ref(['Culture', 'Gastronomie'])
const budget = ref(1200)
const rythme = ref('Équilibré')
const cuisineActive = ref('')

const optionsInteret = ['Culture', 'Nature', 'Gastronomie', 'Shopping', 'Détente', 'Aventure']
const optionsRythme = ['Tranquille', 'Équilibré', 'Intensif']

const allCuisines = [
  { id: 'Italien', img: '/images/italien.jpg', locations: ['Paris', 'Lille', 'Rome'] },
  { id: 'Végétarien', img: '/images/vegan.jpg', locations: ['Paris', 'Lille', 'Berlin'] },
  { id: 'Français', img: '/images/francais.jpg', locations: ['Paris', 'Lille', 'Lyon'] },
  { id: 'Japonais', img: '/images/japonais.jpg', locations: ['Paris', 'Tokyo'] },
  { id: 'Chti', img: '/images/chti.jpg', locations: ['Lille'] },
]

// --- LOGIQUE CALCULÉE ---
const filteredCuisines = computed(() => {
  if (!destination.value) return allCuisines
  return allCuisines.filter(c => 
    c.locations.some(loc => 
      destination.value.toLowerCase().includes(loc.toLowerCase())
    )
  )
})

// --- ÉTATS DE L'API ---
const loading = ref(false)
const lieux = ref<any[]>([])
const errorMsg = ref('')

// --- ACTIONS ---
async function genererItineraire() {
  if (!destination.value.trim()) return
  
  loading.value = true
  errorMsg.value = ''
  lieux.value = []

  try {
    // Utilisation de $fetch pour appeler ton API route
    const data = await $fetch('/api/places/search', {
      query: {
        destination: destination.value,
        categories: pointsInteret.value.join(',')
      }
    })
    lieux.value = data
  } catch (err: any) {
    console.error('Erreur lors de la recherche:', err)
    errorMsg.value = err.data?.message || "Une erreur est survenue lors de la récupération des lieux."
  } finally {
    loading.value = false
  }
}

function toggleInteret(item: string) {
  const index = pointsInteret.value.indexOf(item)
  if (index > -1) {
    pointsInteret.value.splice(index, 1)
  } else {
    pointsInteret.value.push(item)
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
      
      <section class="mb-8">
        <label class="block text-[#D9B54A] text-xs font-bold tracking-widest uppercase mb-4">Destination de rêve</label>
        <UInput 
          v-model="destination" 
          icon="i-heroicons-map-pin-20-solid"
          placeholder="Où souhaitez-vous aller ? (ex: Paris, Tokyo...)" 
          variant="none"
          class="bg-[#2A2A24] rounded-full w-full" 
          :ui="{ base: 'h-14 text-gray-300 px-6', }" 
        />
      </section>

      <section class="mb-8">
        <label class="block text-[#D9B54A] text-xs font-bold tracking-widest uppercase mb-4">Points impératifs</label>
        <div class="flex flex-wrap gap-3">
          <button 
            v-for="item in optionsInteret" 
            :key="item"
            @click="toggleInteret(item)"
            :class="[
              'px-6 py-2 rounded-full text-sm transition-all border',
              pointsInteret.includes(item) ? 'bg-[#D9B54A] border-[#D9B54A] text-black' : 'bg-[#2A2A24] border-transparent text-gray-400 hover:border-[#D9B54A]/50'
            ]"
          >
            {{ item }}
          </button>
        </div>
      </section>

      <section class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <label class="text-[#D9B54A] text-xs font-bold tracking-widest uppercase">Budget Max</label>
          <span class="text-2xl font-bold text-[#D9B54A]">{{ budget }} €</span>
        </div>
        <div class="relative w-full h-6 flex items-center">
          <input 
            v-model="budget" 
            type="range" 
            min="0" 
            max="2000" 
            step="50"
            class="w-full h-1 bg-[#2A2A24] rounded-lg appearance-none cursor-pointer accent-[#D9B54A]" 
          />
        </div>
        <div class="flex justify-between text-[10px] text-gray-500 mt-2 uppercase font-bold">
          <span>0 €</span>
          <span>2 000 €+</span>
        </div>
      </section>

      <section class="mb-8">
        <label class="block text-[#D9B54A] text-xs font-bold tracking-widest uppercase mb-4">Rythme de voyage</label>
        <div class="grid grid-cols-3 bg-[#2A2A24] p-1 rounded-full">
          <button 
            v-for="r in optionsRythme" 
            :key="r" 
            @click="rythme = r" 
            :class="[
              'py-3 rounded-full text-xs font-bold uppercase transition-all',
              rythme === r ? 'bg-[#D9B54A] text-black shadow-lg' : 'text-gray-400'
            ]"
          >
            {{ r }}
          </button>
        </div>
      </section>

      <div class="flex flex-col items-center gap-4">
        <button
          @click="genererItineraire"
          :disabled="loading || !destination"
          class="w-full py-3 bg-[#D9B54A] hover:bg-[#C4A342] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-lg rounded-full flex items-center justify-center gap-2 transition-all shadow-xl shadow-yellow-900/20 uppercase"
        >
          <span v-if="loading">Recherche en cours...</span>
          <span v-else>Générer mon itinéraire</span>
          <UIcon name="i-heroicons-sparkles-20-solid" class="w-5 h-5" />
        </button>
        <p v-if="errorMsg" class="text-red-400 text-xs font-medium">{{ errorMsg }}</p>
      </div>
    </div>

    <div v-if="lieux.length > 0" class="w-full max-w-4xl mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="lieu in lieux" :key="lieu.id" class="bg-[#1A1A14] border border-[#2A2A20] rounded-2xl overflow-hidden flex gap-4 p-4">
        <img v-if="lieu.photo" :src="lieu.photo" class="w-24 h-24 object-cover rounded-xl" />
        <div class="flex flex-col justify-center">
          <h3 class="font-bold text-[#D9B54A]">{{ lieu.nom }}</h3>
          <p class="text-xs text-gray-400">{{ lieu.categorie }}</p>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs font-bold text-white">⭐ {{ lieu.note }}</span>
            <span class="text-[10px] text-gray-500">{{ '€'.repeat(lieu.prix) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom Range Styling */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  background: #D9B54A;
  border: 2px solid #1A1A14;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  cursor: pointer;
}

/* Scrollbar Hide */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>