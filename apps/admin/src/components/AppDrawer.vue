<script setup lang="ts">
// 同舊站抽屜:backdrop 立即顯示/隱藏,.open 控制滑入滑出
defineProps<{ title: string; visible: boolean; open: boolean }>()
defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div class="backdrop" :class="{ hidden: !visible }" @click="$emit('close')"></div>
    <div class="drawer" :class="{ open }">
      <div class="dr-head">
        <div class="dr-title">{{ title }}</div>
        <button class="dr-close" @click="$emit('close')">×</button>
      </div>
      <div class="dr-body">
        <slot />
      </div>
      <div class="dr-foot">
        <button class="btn btn-outline" @click="$emit('close')">取消</button>
        <slot name="save" />
      </div>
    </div>
  </Teleport>
</template>
