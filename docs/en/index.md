---
layout: dummy
---

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vitepress'

const { go } = useRouter()

onMounted(() => {
  go('/en/guide/introduction')
})
</script>
