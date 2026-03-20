<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()

async function logout() {
  await supabase.auth.signOut()
  router.push('/')
}

const items = computed<NavigationMenuItem[]>(() => [{
  label: 'Accueil',
  to: '/',
  icon: 'i-lucide-home',
  active: route.path === '/'
}, {
  label: 'Mon Planning',
  to: '/itinerary',
  icon: 'i-lucide-map-pin-check-inside',
  active: route.path.startsWith('/itinerary')
}, {
  label: 'Mes Voyages',
  to: '/my-travels',
  icon: 'i-lucide-briefcase',
  active: route.path.startsWith('/my-travels')
}])
</script>

<template>
  <UHeader toggle-side="left">
    <template #title>
      <a href="/" class="flex gap-2">
        <img src="/assets/images/logo.png" alt="Mon Logo" width="30" height="20" />
        <span color="text-primary">Voyages facile</span>
      </a>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <!-- Non connecté -->
      <template v-if="!user">
        <UButton to="/login" variant="ghost">Connexion</UButton>
        <UButton to="/register">Inscription</UButton>
      </template>

      <!-- Connecté -->
      <template v-else>
        <UDropdownMenu :items="[[
          { label: user.user_metadata?.first_name || user.email, type: 'label' },
          { label: 'Mon profil', to: '/profil', icon: 'i-lucide-user' },
          { label: 'Mes voyages', to: '/my-travels', icon: 'i-lucide-briefcase' },
        ], [
          { label: 'Se déconnecter', icon: 'i-lucide-log-out', color: 'error', onSelect: logout }
        ]]">
          <UButton variant="ghost" icon="i-lucide-circle-user-round">
            {{ user.user_metadata?.first_name || user.email }}
          </UButton>
        </UDropdownMenu>
      </template>

      <UColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>