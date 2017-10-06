<template>
  <section class="container">
    <img src="../static/img/logo.png" alt="Nuxt.js Logo" class="logo" />
    
  </section>
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
    const wx = window.wx
    const url = window.location.herf

    this.$store.dispatch('getWechatSignature', url).then(res => {
      if (res.data.success) {
        console.log(res.data)
        const params = res.data.params

        wx.config({
            debug: true,
            appId: params.appId,
            timestamp: params.timestamp,
            noneceStr: params.noncestr,
            signatrue: params.signature,
            jsApiList: [
                'chooseImage',
                'previewImage',
                'uploadImage',
                'downloadImage',
                'onMenushareTimeline',
                'hideAllNonBaseMenuItem',
                'showMenuItems'
            ]
        })

        wx.ready(() => {
            wx.hideAllNonBaseMenuItem()
            console.log('success')
        })
      }
    })
  }
}
</script>

<style scoped>
.title
{
  margin-top: 50px;
}
.info
{
  font-weight: 300;
  color: #9aabb1;
  margin: 0;
  margin-top: 10px;
}
.button
{
  margin-top: 50px;
}
</style>
