<script setup lang="ts">
import { escapeHtml, type Sutra } from '@huayuan/shared'

const props = defineProps<{ sutra: Sutra }>()

const paragraphs = computed(() =>
  props.sutra.content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => escapeHtml(line)),
)
</script>

<template>
  <div>
    <div
      class="sutra-page-hero"
      style="
        padding: 60px 56px 50px;
        background: linear-gradient(180deg, #4a2a22, #3a211c);
        color: #f7efd9;
        text-align: center;
      "
    >
      <NuxtLink
        to="/primer"
        style="
          font-size: 13px;
          color: #c9a24b;
          text-decoration: none;
          letter-spacing: 0.1em;
          cursor: pointer;
        "
        >← 返回法寶略節</NuxtLink
      >
      <h1
        style="
          font-family: 'Noto Serif TC', serif;
          font-weight: 500;
          font-size: 42px;
          margin: 18px 0 10px;
          letter-spacing: 0.16em;
        "
      >
        {{ sutra.title }}
      </h1>
      <p
        v-if="sutra.translator"
        style="font-size: 14px; color: #c9a24b; margin: 0; letter-spacing: 0.2em"
      >
        {{ sutra.translator }}
      </p>
    </div>
    <div class="sutra-content-wrap" style="max-width: 860px; margin: 0 auto; padding: 60px 40px 80px">
      <div class="sutra-quote" style="margin-bottom: 36px">
        <!-- eslint-disable vue/no-v-html -- paragraph is pre-escaped with shared escapeHtml above -->
        <p
          v-for="(paragraph, index) in paragraphs"
          :key="index"
          style="
            font-family: 'Noto Serif TC', serif;
            font-size: 19px;
            line-height: 2.25;
            color: #2a1a16;
            margin: 0 0 18px;
            letter-spacing: 0.08em;
            text-align: left;
          "
          v-html="paragraph"
        ></p>
        <!-- eslint-enable vue/no-v-html -->
      </div>
    </div>
  </div>
</template>
