<script setup lang="ts">
const route = useRoute()

const items = computed(() => [{
  label: 'Accueil',
  to: '/',
  active: route.path === '/'
}, {
  label: 'Mon Planning',
  to: '/planner',
  active: route.path.startsWith('/planner')
}, {
  label: 'Mes Voyages',
  to: '/trips',
  active: route.path.startsWith('/trips')
}, {
  label: 'Découvrir',
  to: '/explore',
  active: route.path.startsWith('/explore')
}])

const socials = [
  { icon: 'i-simple-icons-x', label: 'X', to: 'https://x.com' },
  { icon: 'i-simple-icons-facebook', label: 'Facebook', to: 'https://facebook.com' },
  { icon: 'i-simple-icons-instagram', label: 'Instagram', to: 'https://instagram.com' },
  { icon: 'i-simple-icons-tiktok', label: 'TikTok', to: 'https://tiktok.com' }
]
</script>

<template>
  <UFooter class="border-t border-neutral-800 ">
    
    <template #left>
      <div class="flex flex-col gap-1">
        <p class="text-sm font-bold text-[#D4AF37] tracking-wider uppercase">
          Voyages facile
        </p>
      </div>
    </template>

    <UNavigationMenu :items="items" variant="link" class="hidden md:flex" />

    <template #right>
      <div class="flex gap-1">
        <UButton
          v-for="social in socials"
          :key="social.label"
          :icon="social.icon"
          color="neutral"
          variant="ghost"
          :to="social.to"
          target="_blank"
          :aria-label="social.label"
          class="hover:text-[#D4AF37] transition-colors"
        />
      </div>
    </template>

    <template #bottom>
      <div class="flex flex-col items-center w-full gap-4 py-4">
        <div class="w-full border-t border-neutral-800"></div>
        
        <p class="text-neutral-500 text-[10px] uppercase tracking-[0.2em]">
          Copyright © {{ new Date().getFullYear() }} — Smart-Trip Planner
        </p>
      </div>
    </template>
    
  </UFooter>
</template>

