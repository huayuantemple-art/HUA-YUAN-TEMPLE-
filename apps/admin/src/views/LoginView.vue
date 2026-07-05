<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const pwd = ref('')

async function doLogin() {
  if (await auth.login(email.value.trim(), pwd.value)) void router.push('/')
}
</script>

<template>
  <div id="loginScreen">
    <div class="login-box">
      <div class="login-logo">覺</div>
      <h1>華圓覺苑</h1>
      <p>管理後台登入</p>
      <input v-model="email" type="email" placeholder="電子信箱" autocomplete="email" />
      <input v-model="pwd" type="password" placeholder="密碼" autocomplete="current-password" />
      <button @click="doLogin">登入</button>
      <div class="login-err">{{ auth.loginError }}</div>
    </div>
  </div>
</template>
