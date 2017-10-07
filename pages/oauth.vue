<template lang="pug">
  .container
</template>
<script>
import { mapState } from 'vuex'

export default {
  asyncData ({ req }) {
    return {
      name: req ? 'server' : 'client'
    }
  },
  head () {
    return {
      title: `About Page (${this.name}-side)`
    }
  },
  beforeMount () {
    const url = window.location.href

    this.$store.dispatch('getUserByOAuth', encodeURIComponent(url)).then(res => {
        if (res.data.success) {
            console.log(res.data)
        }
    })
  }
}
</script>

<style scoped>
</style>
