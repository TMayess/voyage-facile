<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
definePageMeta({
  layout: 'auth' 
})
const supabase = useSupabaseClient()
const toast = useToast()
const router = useRouter()

const fields: AuthFormField[] = [{
  name: 'password',
  type: 'password',
  label: 'Nouveau mot de passe',
  placeholder: 'Minimum 8 caractères',
  required: true
}, {
  name: 'confirmPassword',
  type: 'password',
  label: 'Confirmer le mot de passe',
  placeholder: 'Répétez le mot de passe',
  required: true
}]

const schema = z.object({
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const { error } = await supabase.auth.updateUser({
    password: payload.data.password
  })

  if (error) {
    toast.add({ title: 'Erreur', description: error.message, color: 'error' })
    return
  }

  toast.add({ title: 'Mot de passe mis à jour !', description: 'Tu peux te connecter.' })
  router.push('/login')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Nouveau mot de passe"
        description="Choisis un nouveau mot de passe pour ton compte."
        icon="i-lucide-lock-keyhole-open"
        :fields="fields"
        :submit-button="{ label: 'Mettre à jour' }"
        @submit="onSubmit"
      />
    </UPageCard>
  </div>
</template>