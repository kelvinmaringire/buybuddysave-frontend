<template>
  <q-page>
    <img src="~assets/auth/wave.png" class="wave" alt="reset-wave" />
    <div class="row" style="height: 90vh">
      <div class="col-0 col-md-6 flex justify-center content-center">
        <img src="~assets/auth/login.svg" class="responsive" alt="reset-image" />
      </div>
      <div :class="{ 'justify-center': $q.screen.md || $q.screen.sm || $q.screen.xs }"
           class="col-12 col-md-6 flex content-center">
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
                <h2 class="text-h2 text-uppercase q-my-none text-weight-regular">Confirm</h2>
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-form @submit.prevent="submitNewPassword" class="q-gutter-md">
              <q-input
                v-model="newPassword"
                label="New Password"
                :type="isPwd ? 'password' : 'text'"
                :rules="[
                  val => !!val || 'Password is required',
                  val => val.length >= 8 || 'Password must be at least 8 characters'
                ]"
              >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
              <q-input
                v-model="confirmPassword"
                label="Confirm Password"
                :type="isPwd ? 'password' : 'text'"
                :rules="[
                  val => !!val || 'Please confirm password',
                  val => val === newPassword || 'Passwords do not match'
                ]"
              />
              <q-btn
                class="full-width"
                color="primary"
                label="Reset Password"
                type="submit"
                rounded
                :loading="loading"
              />
              <div class="text-center q-mt-sm q-gutter-lg">
                <router-link class="text-primary" :to="{ name: 'login' }">Login</router-link>
                <router-link class="text-primary" :to="{ name: 'register' }">Create account</router-link>
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
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const isPwd = ref(true)
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const uidb64 = route.params.uidb64
const token = route.params.token

const submitNewPassword = async () => {
  loading.value = true
  try {
    await api.post(`accounts/password-reset-confirm/${uidb64}/${token}/`, {
      new_password: newPassword.value,
      confirm_password: confirmPassword.value
    })
    $q.notify({
      type: 'positive',
      message: 'Password has been reset successfully. You can now log in with your new password.',
      position: 'top'
    })
    router.push({ name: 'login' })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.detail || 'Invalid or expired reset link.',
      position: 'top'
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
