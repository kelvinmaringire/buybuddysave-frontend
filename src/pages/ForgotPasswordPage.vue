<template>
  <q-page>
    <img src="~assets/auth/wave.png" class="wave" alt="login-wave" />
    <div class="row" style="height: 90vh">
      <div class="col-0 col-md-6 flex justify-center content-center">
        <img src="~assets/auth/login.svg" class="responsive" alt="login-image" />
      </div>
      <div
        :class="{ 'justify-center': $q.screen.md || $q.screen.sm || $q.screen.xs }"
        class="col-12 col-md-6 flex content-center"
      >
        <q-card :style="$q.screen.lt.sm ? { width: '80%' } : { width: '50%' }">
          <q-card-section>
            <router-link to="/">
              <q-avatar size="103px" class="absolute-center shadow-10">
                <img src="~assets/auth/logo.png" alt="avatar" />
              </q-avatar>
            </router-link>
          </q-card-section>
          <q-card-section>
            <div class="q-pt-lg">
              <div class="col text-h6 ellipsis flex justify-center">
                <h2 class="text-h2 text-uppercase q-my-none text-weight-regular">Reset</h2>
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-form class="q-gutter-md" @submit.prevent="submitResetRequest">
              <q-input
                v-model="email"
                ref="emailRef"
                label="Email"
                type="email"
                :rules="[(val) => !!val || 'Email is required', isValidEmail]"
              />
              <div>
                <q-btn
                  class="full-width"
                  color="primary"
                  label="Send Reset Link"
                  type="submit"
                  rounded
                  :loading="loading"
                />
                <div class="text-center q-mt-sm q-gutter-lg">
                  <router-link class="text-primary" :to="{ name: 'login' }">Login</router-link>
                  <router-link class="text-primary" :to="{ name: 'register' }"
                    >Create account</router-link
                  >
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/auth-store'
import { api } from 'boot/axios'

const authStore = useAuthStore()
const $q = useQuasar()
const email = ref('')
const emailRef = ref(null)
const loading = ref(false)

const isValidEmail = (val) => {
  const emailPattern =
    /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
  return emailPattern.test(val) || 'Invalid email'
}

const submitResetRequest = async () => {
  loading.value = true

  const existingUsers = authStore.users || [] // Make sure this is populated correctly
  const trimmedEmail = email.value.trim().toLowerCase()

  const emailExists = existingUsers.some((user) => user.email.toLowerCase() === trimmedEmail)

  if (!emailExists) {
    $q.notify({
      type: 'negative',
      message: 'Your email is not registered. Please create an account.',
      position: 'top',
    })
    loading.value = false
    return
  }

  try {
    await api.post('accounts/password-reset/', { email: trimmedEmail })
    $q.notify({
      type: 'positive',
      message: 'We have sent you a password reset link. Please check your inbox or spam folder.',
      position: 'top',
    })
    email.value = ''
    // Remove focus from QInput components
    emailRef.value?.resetValidation()

    // Explicitly blur the native input elements
    emailRef.value?.$el.querySelector('input')?.blur()
  } catch (error) {
    console.log(error)
    $q.notify({
      type: 'negative',
      message: 'An error occurred. Please try again.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.wave {
  position: fixed;
  height: 100%;
  left: 0;
  bottom: 0;
  z-index: -1;
}
</style>
