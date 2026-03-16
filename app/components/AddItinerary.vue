<template>
  <UModal v-model="isOpen" :ui="{ width: 'max-w-2xl', background: 'bg-[#1a1611]', border: 'border-zinc-800' }">
    <div class="p-6 text-white font-sans">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-2">
          <div class="bg-amber-500 p-1.5 rounded-full">
            <UIcon name="i-heroicons-compass" class="w-5 h-5 text-black" />
          </div>
          <h2 class="text-xl font-bold">Ajouter une étape</h2>
        </div>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark-20-solid"
          class="-my-1"
          @click="isOpen = false"
        />
      </div>

      <div class="flex gap-2 mb-8">
        <UInput
          icon="i-heroicons-magnifying-glass"
          placeholder="Rechercher un lieu, monument, resto..."
          class="flex-1"
          size="lg"
          :ui="{ 
            base: 'bg-zinc-800/50 border-none text-white focus:ring-1 focus:ring-amber-500',
            placeholder: 'placeholder-zinc-500' 
          }"
        />
        <UButton color="amber" size="lg" class="px-6 font-bold text-black hover:bg-amber-400">
          Rechercher
        </UButton>
      </div>

      <section class="mb-8">
        <div class="flex justify-between items-end mb-4">
          <h3 class="font-semibold text-zinc-300">Suggestions à proximité</h3>
          <button class="text-xs text-amber-500 font-medium">Voir tout</button>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div v-for="place in suggestions" :key="place.name" class="group cursor-pointer">
            <div class="relative aspect-[4/3] rounded-3xl overflow-hidden mb-2">
              <img :src="place.image" :alt="place.name" class="object-cover w-full h-full transition-transform group-hover:scale-110" />
              <div v-if="place.popular" class="absolute top-2 left-2 bg-amber-500 text-[10px] font-bold text-black px-2 py-0.5 rounded-full">
                Populaire
              </div>
            </div>
            <h4 class="font-bold text-sm">{{ place.name }}</h4>
            <p class="text-[10px] text-zinc-400 flex items-center gap-1">
              <UIcon name="i-heroicons-map-pin" class="w-3 h-3" />
              {{ place.dist }} km • {{ place.type }}
            </p>
          </div>
        </div>
      </section>

      <section class="mb-8">
        <h3 class="font-semibold text-zinc-300 mb-4">Catégories</h3>
        <div class="grid grid-cols-4 gap-3">
          <button v-for="cat in categories" :key="cat.label" class="bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/50 rounded-full py-4 flex flex-col items-center gap-2 transition-colors">
            <UIcon :name="cat.icon" class="w-6 h-6 text-amber-500" />
            <span class="text-[11px] font-medium">{{ cat.label }}</span>
          </button>
        </div>
      </section>

      <section class="mb-8">
        <h3 class="font-semibold text-zinc-300 mb-4">Lieux populaires</h3>
        <div class="bg-zinc-800/30 border border-zinc-700/50 rounded-2xl p-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="bg-amber-900/30 p-2 rounded-xl">
              <UIcon name="i-heroicons-building-library" class="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h4 class="text-sm font-bold">Cathédrale Notre-Dame</h4>
              <p class="text-[10px] text-zinc-500">6 Parvis Notre-Dame - Pl. Jean-Paul II, Paris</p>
            </div>
          </div>
          <UButton icon="i-heroicons-plus" variant="outline" color="amber" class="rounded-full w-8 h-8 p-0 flex items-center justify-center border-zinc-700" />
        </div>
      </section>

      <div class="flex justify-end gap-3 pt-4 border-t border-zinc-800">
        <UButton variant="ghost" color="white" class="px-8 rounded-full bg-zinc-800/50 hover:bg-zinc-800" @click="isOpen = false">
          Annuler
        </UButton>
        <UButton color="amber" class="px-8 rounded-full font-bold text-black" @click="isOpen = false">
          Valider l'étape
        </UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup>
const isOpen = defineModel()

const suggestions = [
  { name: 'Tour Eiffel', dist: '1.2', type: 'Monument', popular: true, image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=400' },
  { name: 'Musée du Louvre', dist: '0.5', type: 'Art', popular: false, image: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&q=80&w=400' },
  { name: 'Jardin des Tuileries', dist: '0.8', type: 'Parc', popular: false, image: 'https://images.unsplash.com/photo-1550340499-a6c60bb828a1?auto=format&fit=crop&q=80&w=400' }
]

const categories = [
  { label: 'Culture', icon: 'i-heroicons-home-modern' },
  { label: 'Gastronomie', icon: 'i-heroicons-utensils' },
  { label: 'Parcs', icon: 'i-heroicons-tree-days' },
  { label: 'Shopping', icon: 'i-heroicons-shopping-bag' }
]
</script>