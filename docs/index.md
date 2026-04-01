---
layout: dummy
---

<script setup>
import { onMounted } from 'vue'
import { useRouter, useData } from 'vitepress'

const { go } = useRouter()
const { lang } = useData()

onMounted(() => {
  const path = lang.value === 'en' ? '/en/guide/introduction' : '/guide/introduction'
  go(path)
})
</script>
