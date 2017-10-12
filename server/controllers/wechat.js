import api from '../api'
import config from '../config'
import { parse as urlParse } from 'url'
import { parse as queryParse } from 'querystring'

export async function signature (ctx, next) {
  let url = ctx.query.url

  if (!url) ctx.throw(404)

  url = decodeURIComponent(url)
  let params = await api.wechat.getSignatureAsync(url)

  ctx.body = {
    success: true,
    params: params
  }
}

// 网页上点某按钮，直接跳转到 http://x.o/wechat-redirect?visit=a&id=b
// 用户被重定向到 Wechat Redirect URL 授权验证
// 验证后，自动二跳进入 http://x.o/oauth?code=xxxxxx&state=a_b
export async function redirect (ctx, next) {
  let target = config.SITE_ROOT_URL + '/oauth'
  let scope = 'snsapi_userinfo'
  const { a, b } = ctx.query
  const params = `${a}_${b}`

  const url = api.wechat.getAuthorizeURL(scope, target, params)

  ctx.redirect(url)
}

export async function oauth (ctx, next) {

  const url = ctx.query.url
  console.log("query",ctx.query)
  const urlObj = urlParse(decodeURIComponent(url))
  const params = queryParse(urlObj.query)
  console.log('params',params)
  const code = params.code
  const user = await api.wechat.getUserByCode(code)

  console.log(user)
  ctx.session = {
    openid: user.openid
  }
  ctx.body = {
    success: true,
    data: user
  }
}
