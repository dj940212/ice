import request from 'request-promise'
import formstream from 'formstream'
import fs from 'fs'
import path from 'path'
import * as _ from 'lodash'

const base = 'https://api.weixin.qq.com/cgi-bin/'
const api = {
    // 签名
    accessToken: base + 'token?grant_type=client_credential',
    // 临时素材
    temporary: {
        upload: base + 'media/upload?',
        fetch: base + 'media/get?'
    },
    // 永久素材
    permanent: {
        upload: base + 'material/add_material?',
        uploadNews: base + 'material/add_news?',
        uploadNewsPic: base + 'media/uploadimg?',
        fetch: base + 'material/get_material?',
        del: base + 'material/del_material?',
        update: base + 'material/update_news?',
        count: base + 'material/get_materialcount?',
        batch: base + 'material/batchget_material?'
    },
}

function statFile (filepath) {
    return new Promise((resolve, reject) => {
        fs.stat(filepath, (err, stat) => {
            if (err) reject(err)
            else resolve(stat)
        })
    })
}

export default class Wechat {
    constructor(opts) {
        this.opts = Object.assign({}, opts)
        this.appID = opts.appID
        this.appSecret = opts.appSecret
        this.getAccessToken = opts.getAccessToken
        this.saveAccessToken = opts.saveAccessToken

        this.fetchAccessToken()
    }

    // 请求
    async request(options) {
        options = Object.assign({}, options, {json:true})

        try {
            const response = await request(options)
            // console.log('request', response)
            return response
        }catch(error) {
            console.error(error)
        }
        

        return response
    }

    // 获取签名
    async fetchAccessToken() {
        let data = await this.getAccessToken()

        console.log("fetchAccessToken",data)

        if (!this.isValidAccessToken(data)) {
            data = await this.updateAccessToken()
        }

        try {
            await this.saveAccessToken(data)
            
            console.log("保存token")
        }catch(e) {
            console.log("保存出错了")
        }
        
        return data
    }

    // 更新签名
    async updateAccessToken() {
        const url = api.accessToken + '&appid=' + this.appID + '&secret=' + this.appSecret

        const data = await this.request({url: url})

        console.log("updateAccessToken", data)
        
        const now = new Date().getTime()
        const expiresIn = now + (data.expires_in - 20) * 1000

        data.expires_in = expiresIn


        return data
    }

    // 判断签名是否有效
    isValidAccessToken(data) {
        if (!data || !data.access_token || !data.expires_in) {
            return false
        }
        const expiresIn = data.expires_in
        const now = (new Date().getTime())

        if (now < expiresIn) {
            return true
        }else {
            return false
        }
    }

    // 操作
    async handle (operation, ...args) {
        const tokenData = await this.fetchAccessToken()
        const options = this[operation](tokenData.access_token, ...args)
        const data = await this.request(options)

        // console.log('data:', data)

        return data
    }

    // 上传素材
    uploadMaterial (token, type, material, permanent) {
        let form = {}
        let url = api.temporary.upload

        if (permanent) {
            url = api.permanent.upload

            _.extend(form, permanent)
        }

        if (type === 'pic') {
            url = api.permanent.uploadNewsPic
        }

        if (type === 'news') {
            url = api.permanent.uploadNews
            form = material
        } else {
            form.media = fs.createReadStream(material)
        }

        let uploadUrl = url + 'access_token=' + token

        if (!permanent) {
            uploadUrl += '&type=' + type
        } else {
            if (type !== 'news') {
                form.access_token = token
            }
        }

        const options = {
            method: 'POST',
            url: uploadUrl,
            json: true
        }

        if (type === 'news') {
            options.body = form
        } else {
            options.formData = form
        }

        return options
    }

    // 获取素材
    fetchMaterial (token, mediaId, type, permanent) {
        let form = {}
        let fetchUrl = api.temporary.fetch

        if (permanent) {
            fetchUrl = api.permanent.fetch
        }

        let url = fetchUrl + 'access_token=' + token
        let options = {method: 'POST', url: url}

        if (permanent) {
            form.media_id = mediaId
            form.access_token = token
            options.body = form
        } else {
            if (type === 'video') {
                url = url.replace('https://', 'http://')
            }

            url += '&media_id=' + mediaId
        }

        return options
    }

    // 删除素材
    deleteMaterial (token, mediaId) {
        const form = {
          media_id: mediaId
        }
        const url = api.permanent.del + 'access_token=' + token + '&media_id' + mediaId

        return {method: 'POST', url: url, body: form}
      }

    // 更新素材
    updateMaterial (token, mediaId, news) {
        const form = {
          media_id: mediaId
        }

        _.extend(form, news)
        const url = api.permanent.update + 'access_token=' + token + '&media_id=' + mediaId

        return {method: 'POST', url: url, body: form}
      }

    // 素材总数
    countMaterial (token) {
        const url = api.permanent.count + 'access_token=' + token

        return {method: 'POST', url: url}
    }

    // 素材列表
    batchMaterial (token, options) {
        options.type = options.type || 'image'
        options.offset = options.offset || 0
        options.count = options.count || 10

        const url = api.permanent.batch + 'access_token=' + token

        return {method: 'POST', url: url, body: options}
    }



}