import Router from 'koa-router'
import sha1 from 'sha1'
import config from '../config'
// import {getWechat} from '../wechat'
import reply from '../wechat/reply'
import wechatMiddle from '../wechat-lib/middleware'

// getWechat()

export default app => {
    const router = new Router()

    router.all('/wechat-hear', wechatMiddle(config.wechat, reply))

    app.use(router.routes())
    app.use(router.allowedMethods())
}

