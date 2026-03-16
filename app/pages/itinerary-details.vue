<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white p-6 font-sans">
    <div class="max-w-4xl mx-auto space-y-8">
      
      <header class="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1554944853-7326c999c4b2?auto=format&fit=crop&q=80&w=1200" 
          alt="Musée d'Art Moderne"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
          <UBadge color="amber" variant="solid" size="xs" class="w-fit mb-3 uppercase font-bold tracking-wider">Culture</UBadge>
          <h1 class="text-5xl font-bold mb-2">Musée d'Art Moderne</h1>
          <div class="flex items-center text-gray-300 text-sm">
            <UIcon name="i-heroicons-map-pin" class="mr-2 text-amber-400" />
            11 Avenue du Président Wilson, 75116 Paris
          </div>
        </div>
        <UButton
          icon="i-heroicons-x-mark"
          color="gray"
          variant="soft"
          class="absolute top-6 right-6 rounded-full bg-black/40 backdrop-blur-md"
        />
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-2 space-y-8">
          <section>
            <div class="flex items-center gap-2 mb-4">
              <UIcon name="i-heroicons-sparkles-solid" class="text-amber-400 text-xl" />
              <h2 class="text-xl font-bold text-gray-100">Pourquoi l'IA l'a choisi</h2>
            </div>
            <p class="text-gray-400 leading-relaxed text-sm">
              Ce musée emblématique a été sélectionné pour sa collection exceptionnelle d'art du XXe siècle et son architecture monumentale offrant une expérience culturelle immersive au cœur de Paris. Il représente le parfait équilibre entre l'histoire de l'art moderne et la vitalité contemporaine.
            </p>
          </section>

          <div class="grid grid-cols-3 gap-4">
            <UCard class="bg-white/5 border-none text-center" :ui="{ body: { padding: 'px-4 py-6' } }">
              <UIcon name="i-heroicons-clock" class="text-amber-400 mb-2 text-xl" />
              <div class="text-[10px] uppercase text-gray-500 font-bold mb-1">Durée</div>
              <div class="font-bold">1h30</div>
            </UCard>
            <UCard class="bg-white/5 border-none text-center" :ui="{ body: { padding: 'px-4 py-6' } }">
              <UIcon name="i-heroicons-banknotes" class="text-amber-400 mb-2 text-xl" />
              <div class="text-[10px] uppercase text-gray-500 font-bold mb-1">Prix</div>
              <div class="font-bold">Gratuit</div>
            </UCard>
            <UCard class="bg-white/5 border-none text-center" :ui="{ body: { padding: 'px-4 py-6' } }">
              <UIcon name="i-heroicons-users" class="text-amber-400 mb-2 text-xl" />
              <div class="text-[10px] uppercase text-gray-500 font-bold mb-1">Affluence</div>
              <div class="font-bold">Faible</div>
            </UCard>
          </div>
        </div>

        <aside>
          <UCard class="bg-[#111218] border-none ring-1 ring-white/10 sticky top-6">
            <div class="space-y-6">
              <div>
                <h3 class="font-bold mb-2">Planifier votre visite</h3>
                <p class="text-xs text-gray-400">Optimisez votre trajet avec notre assistant intelligent.</p>
              </div>

              <div class="space-y-3">
                <UButton
                  block
                  color="amber"
                  class="font-bold py-3 text-black"
                  label="S'Y RENDRE"
                  icon="i-heroicons-truck"
                />
                <UButton
                  block
                  variant="outline"
                  color="amber"
                  class="font-bold py-3 bg-transparent border-2 border-amber-400/30 hover:bg-amber-400/10"
                  label="RÉGÉNÉRER CETTE ÉTAPE"
                  icon="i-heroicons-arrow-path"
                />
              </div>
              
              <p class="text-[10px] text-center italic text-gray-500">
                Ouvert aujourd'hui : 10h00 - 18h00
              </p>
            </div>
          </UCard>
        </aside>
      </div>

      <section class="space-y-4">
        <div class="flex justify-between items-end">
          <h2 class="text-xl font-bold">Localisation</h2>
          <UButton variant="link" color="amber" size="xs" class="underline decoration-amber-400/30">Ouvrir dans Maps</UButton>
        </div>
        <div class="h-64 rounded-3xl overflow-hidden grayscale brightness-75 border border-white/10 relative">
          <div class="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center">
             <UIcon name="i-heroicons-map" class="text-5xl text-white/10" />
          </div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div class="relative flex items-center justify-center">
              <div class="absolute w-12 h-12 bg-white/20 rounded-full animate-ping"></div>
              <UIcon name="i-heroicons-map-pin-solid" class="text-4xl text-amber-400 relative z-10" />
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
  <AddStepModal v-model="showModal" />
</template>

<script setup>
const showModal = ref(true)
</script>

<style>
.dark-card-gradient {
  background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%);
}
</style>