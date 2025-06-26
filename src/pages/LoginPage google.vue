<template>
  <q-page>
    <img src="~assets/auth/wave.png" class="wave" alt="login-wave" />
    <div class="row" style="height: 90vh">
      <div class="col-0 col-md-6 flex justify-center content-center">
        <img src="~assets/auth/login.svg" class="responsive" alt="login-image" />
      </div>
      <div
        v-bind:class="{ 'justify-center': $q.screen.md || $q.screen.sm || $q.screen.xs }"
        class="col-12 col-md-6 flex content-center"
      >
        <q-card v-bind:style="$q.screen.lt.sm ? { width: '80%' } : { width: '50%' }">
          <q-card-section>
            <router-link to="/">
              <q-avatar size="103px" class="absolute-center shadow-10" to="/">
                <img src="~assets/auth/logo.png" alt="avatar" />
              </q-avatar>
            </router-link>
          </q-card-section>
          <q-card-section>
            <div class="q-pt-lg">
              <div class="col text-h6 ellipsis flex justify-center">
                <h2 class="text-h2 q-my-none text-weight-regular">Login</h2>
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-form class="q-gutter-md" @submit.prevent="onLogin">
              <q-input label="Username" v-model="credentials.username"> </q-input>
              <q-input
                label="Password"
                :type="isPwd ? 'password' : 'text'"
                v-model="credentials.password"
              >
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>
              <div>
                <q-btn
                  class="full-width"
                  color="primary"
                  label="Login"
                  type="submit"
                  rounded
                ></q-btn>

                <!-- Divider with "or" text -->
                <div class="row items-center q-my-md">
                  <div class="col"><q-separator /></div>
                  <div class="col-auto q-px-sm text-grey">or</div>
                  <div class="col"><q-separator /></div>
                </div>

                <!-- Google Login Button -->
                <q-card-section class="q-pb-none">
                  <q-btn
                    class="full-width q-mb-md"
                    color="white"
                    text-color="black"
                    label="Continue with Google"
                    rounded
                    outline
                    @click="onGoogleLogin"
                  >
                    <template v-slot:prepend>
                      <img :src="googleIcon" alt="Google" style="width: 20px; height: 20px" />
                    </template>
                  </q-btn>

                  <q-separator />
                </q-card-section>

                <div class="text-center q-mt-sm q-gutter-lg">
                  <router-link class="text-primary" :to="{ name: 'password_reset' }"
                    >Forgot your password?</router-link
                  >
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
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/auth-store'

import googleIcon from '../assets/auth/google.png'

defineOptions({
  name: 'LoginPage',
})

const authStore = useAuthStore()
const router = useRouter()
const $q = useQuasar()

const isPwd = ref(true)
const credentials = ref({
  username: '',
  password: '',
})

async function onLogin() {
  if (!credentials.value.username || !credentials.value.password) {
    $q.notify({
      type: 'negative',
      message: 'The provided data is invalid.',
      position: 'top',
    })
  } else if (credentials.value.password.length < 6) {
    $q.notify({
      type: 'negative',
      message: 'The password must have 6 or more characters.',
      position: 'top',
    })
  } else {
    try {
      credentials.value.username = credentials.value.username.trim().toLowerCase()
      // Call the doLogin action from the Pinia store with the provided credentials
      await authStore.doLogin(credentials.value)

      $q.notify({
        type: 'positive',
        message: 'Authenticated',
        position: 'top',
      })

      router.push({ name: 'dashboard' })
    } catch (err) {
      if (err.response.data.detail) {
        $q.notify({
          type: 'negative',
          message: err.response.data.detail,
          position: 'top',
        })
      }
    }
  }
}

function onGoogleLogin() {
  // You'll need to implement the Google OAuth flow here
  // This typically involves redirecting to your backend's Google auth endpoint
  // or using Firebase Auth or similar service
  window.location.href = '/api/auth/google' // Example endpoint - adjust to your backend

  // Alternatively, if using Firebase:
  // import { auth, googleAuthProvider } from '../firebase'
  // auth.signInWithPopup(googleAuthProvider)
  //   .then(() => router.push({ name: 'dashboard' }))
  //   .catch(error => {
  //     $q.notify({
  //       type: 'negative',
  //       message: error.message,
  //       position: 'top'
  //     })
  //   })
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
