<template lang="pug">
.container
  .shopping
    .title 权游周边
    .list
      .items(v-for='(item, index) in products' :key='index' @click='showProduct(item)')
        img(:src='myImageCDN + item.images[0]')
        .body
          .title {{item.title}}
          .content {{item.intro}}
</template>

<script>
import { mapState } from 'vuex'

export default {
  // middleware: 'wechat-auth',
  head () {
    return {
      title: '手办商城'
    }
  },

  computed: {
    ...mapState([
      'products',
      'myImageCDN'
    ])
  },

  methods: {
    showProduct (item) {
      this.$router.push({
        path: '/deal',
        query: {
          id: item._id
        }
      })
    }
  },

  beforeCreate () {
    this.$store.dispatch('fetchProducts')
  }
}
</script>

<style scoped lang='sass' src='../../static/sass/shopping.sass'></style>



