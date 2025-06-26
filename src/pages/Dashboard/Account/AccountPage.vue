<template>
    <q-banner dense inline-actions class="text-white bg-primary q-mb-lg">
      <div class="text-h5">Account Settings</div>
      <template v-slot:action>
        <q-btn dense round flat icon="account_circle" />
      </template>
    </q-banner>

    <q-list separator bordered class="q-mb-lg">
      <q-item :to="{name: 'profile'}" clickable v-ripple>
        <q-item-section class="text-h5 text-weight-light">
          Profile Settings
        </q-item-section>
      </q-item>

      <!--q-item clickable v-ripple>
        <q-item-section class="text-h5 text-weight-light">
          Buddy Reviews
        </q-item-section>
      </q-item-->

      <q-item :to="{name: 'change_password'}"  clickable v-ripple>
        <q-item-section class="text-h5 text-weight-light">
          Password Change
        </q-item-section>
      </q-item>
    </q-list>

    <q-list bordered separator>
      <q-item clickable v-ripple>
        <q-btn flat size="lg" color="negative" icon="logout" label="LOGOUT" @click="logout()" />
      </q-item>

    </q-list>

</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/auth-store'

const authStore = useAuthStore()
const router = useRouter()

function logout () {
  authStore.logout()
  router.push({ name: 'deals' })
}

</script>
