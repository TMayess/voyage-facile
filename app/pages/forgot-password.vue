<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
definePageMeta({
  layout: 'auth' 
})
const supabase = useSupabaseClient()
const toast = useToast()

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'jean.dupont@exemple.fr',
  required: true
}]

const schema = z.object({
  email: z.string().email('Email invalide')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const { error } = await supabase.auth.resetPasswordForEmail(payload.data.email, {
    redirectTo: `${window.location.origin}/reset-password`
  })

  if (error) {
    toast.add({ title: 'Erreur', description: error.message, color: 'error' })
    return
  }

  toast.add({ title: 'Email envoyé !', description: 'Vérifie ta boîte mail.' })
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Mot de passe oublié"
        description="On t'envoie un lien pour réinitialiser ton mot de passe."
        icon="i-lucide-lock-keyhole"
        :fields="fields"
        :submit-button="{ label: 'Envoyer le lien' }"
        @submit="onSubmit"
      >
        <template #footer>
          <NuxtLink to="/login" class="text-primary font-medium">Retour à la connexion</NuxtLink>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>