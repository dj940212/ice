import Router from 'koa-router'
import sha1 from 'sha1'
import config from '../config'
import {getWechat} from '../wechat'

export default app => {
    const router = new Router()

    console.log('router')

    router.get('/wechat-hear', (ctx, next) => {
        
        getWechat()

        const token = config.token
        const {
            signature,
            nonce,
            timestamp,
            echostr
        } = ctx.query

        const str = [token, timestamp, nonce].sort().join('')
        const sha = sha1(str)

        console.log(sha === signature)
        if (sha === signature) {
            ctx.body = echostr
        }else {
            ctx.body = 'Failed'
        }
    })


    app.use(router.routes())
    app.use(router.allowedMethods())
}

