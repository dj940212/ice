import Router from 'koa-router'
import sha1 from 'sha1'
import config from '../config'
import {getWechat} from '../wechat'
import {resolve} from 'path'
import reply from '../wechat/reply'
import wechatMiddle from '../wechat-lib/middleware'

// getWechat()

export default app => {
    const router = new Router()

    router.all('/wechat-hear', wechatMiddle(config.wechat, reply))

    // 上传素材
    router.get('/upload',async (ctx, next) => {
    	let client = getWechat()

    	const data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../../../../Study/vue+node高级全栈/baby.jpg'),{
    		type: 'image', description: '{"title": "haha", "introduction": "heihei"}'})

    	console.log("data:",data)
    })

    app.use(router.routes())
    app.use(router.allowedMethods())
}

