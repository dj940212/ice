import Router from 'koa-router'
import sha1 from 'sha1'
import config from '../config'
import {getWechat} from '../wechat'
import {resolve} from 'path'
import reply from '../wechat/reply'
import wechatMiddle from '../wechat-lib/middleware'
import { signature, redirect, oauth } from '../controllers/wechat'

// getWechat()

export default app => {
    const router = new Router()

    router.all('/wechat-hear', wechatMiddle(config.wechat, reply))
    router.get('/wechat-signature', signature)
    router.get('/wechat-redirect', redirect)
    router.get('/wechat-oauth', oauth)

    app.use(router.routes())
    app.use(router.allowedMethods())
}

