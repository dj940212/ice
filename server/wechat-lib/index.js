import request from 'request-promise'
import formstream from 'formstream'
import fs from 'fs'
import path from 'path'
import * as _ from 'lodash'
import {sign} from './util'

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
    // 标签
    tag: {
        create: base + 'tags/create?',
        fetch: base + 'tags/get?',
        update: base + 'tags/update?',
        del: base + 'tags/delete?',
        fetchUsers: base + 'user/tag/get?',
        batchTag: base + 'tags/members/batchtagging?',
        batchUnTag: base + 'tags/members/batchuntagging?',
        getTagList: base + 'tags/getidlist?'
    },

    // 用户管理
    user: {
        remark: base + 'user/info/updateremark?',
        info: base + 'user/info?',
        batchInfo: base + 'user/info/batchget?',
        fetchUserList: base + 'user/get?',
        getBlackList: base + 'tags/members/getblacklist?',
        batchBlackUsers: base + 'tags/members/batchblacklist?',
        batchUnblackUsers: base + 'tags/members/batchunblacklist?'
    },

    // 菜单
    menu: {
        create: base + 'menu/create?',
        get: base + 'menu/get?',
        del: base + 'menu/delete?',
        addCondition: base + 'menu/addconditional?',
        delCondition: base + 'menu/delconditional?',
        getInfo: base + 'get_current_selfmenu_info?'
    },

    ticket: {
        get: base + 'ticket/getticket?'
    }
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
        this.getTicket = opts.getTicket
        this.saveTicket = opts.saveTicket

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
    async fetchAccessToken () {
        let data = await this.getAccessToken()

        console.log("fetchAccessToken",data)

        if (!this.isValidToken(data, 'access_token')) {
            data = await this.updateAccessToken()
        }

        try {
            await this.saveAccessToken(data)
            
            console.log("保存签名成功")
        }catch(e) {
            console.log("保存出错了")
        }
        
        return data
    }

    // 获取票据
    async fetchTicket (token) {
        let data = await this.getTicket()

        if (!this.isValidToken(data, 'ticket')) {
            data = await this.updateTicket(token)
        }

        console.log("Ticket",data)

        // console.log(this.saveTicket)

        await this.saveTicket(data)
        
        try {
            await this.saveTicket(data)
            
            console.log("保存票据成功")
        }catch(e) {
            console.log("保存出错了")
        }

        
        
        return data
    }

    // 更新票据
    async updateTicket (token) {
        const url = api.ticket.get + '&access_token=' + token + '&type=jsapi'

        const data = await this.request({url: url})

        const now = new Date().getTime()
        const expiresIn = now + (data.expires_in - 20) * 1000

        data.expires_in = expiresIn


        return data
    }

    // 更新签名
    async updateAccessToken () {
        const url = api.accessToken + '&appid=' + this.appID + '&secret=' + this.appSecret

        const data = await this.request({url: url})

        console.log("updateAccessToken", data)
        
        const now = new Date().getTime()
        const expiresIn = now + (data.expires_in - 20) * 1000

        data.expires_in = expiresIn


        return data
    }

    // 判断签名&票据是否有效
    isValidToken (data, name) {
        if (!data || !data[name] || !data.expires_in) {
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

        console.log('options:', options)

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

    // 创建标签
    createTag (token, name) {
        const form = {
          tag: {
            name: name
          }
        }
        const url = api.tag.create + 'access_token=' + token

        return {method: 'POST', url: url, body: form}
    }

    // 获取标签
    fetchTags (token) {
        const url = api.tag.fetch + 'access_token=' + token

        return {url: url}
    }

    // 编辑标签
    updateTag (token, tagId, name) {
        const form = {
          tag: {
            id: tagId,
            name: name
          }
        }

        const url = api.tag.update + 'access_token=' + token

        return {method: 'POST', url: url, body: form}
    }

    // 删除标签
    delTag (token, tagId) {
        const form = {
          tag: {
            id: tagId
          }
        }

        const url = api.tag.del + 'access_token=' + token

        return {method: 'POST', url: url, body: form}
    }

    // 获取标签用户
    fetchTagUsers (token, tagId, openId) {
        const form = {
          tagid: tagId,
          next_openid: openId || ''
        }
        const url = api.tag.fetchUsers + 'access_token=' + token

        return {method: 'POST', url: url, body: form}
    }

    // 批量为用户打标签
    batchTag (token, openIdList, tagId, unTag) {
        const form = {
          openid_list: openIdList,
          tagid: tagId
        }
        let url = api.tag.batchTag

        if (unTag) {
          url = api.tag.batchUnTag
        }

        url += 'access_token=' + token

        return {method: 'POST', url: url, body: form}
    }

    // 标签列表
    getTagList (token, openId) {
        const form = {
          openid: openId
        }
        const url = api.tag.getTagList + 'access_token=' + token

        return {method: 'POST', url: url, body: form}
    }

    remarkUser (token, openId, remark) {
        const form = {
          openid: openId,
          remark: remark
        }
        const url = api.user.remark + 'access_token=' + token

        return {method: 'POST', url: url, body: form}
    }

    getUserInfo (token, openId, lang) {
        const url = `${api.user.info}access_token=${token}&openid=${openId}&lang=${lang || 'zh_CN'}`

        return {url: url}
    }

    batchUserInfo (token, userList) {
        const url = api.user.batchInfo + 'access_token=' + token
        const form = {
          user_list: userList
        }

        return {method: 'POST', url: url, body: form}
    }

    fetchUserList (token, openId) {
        const url = `${api.user.fetchUserList}access_token=${token}&next_openid=${openId || ''}`

        return {url: url}
    }

    // 创建菜单
    createMenu (token, menu) {
        const url = api.menu.create + 'access_token=' + token

        return {method: 'POST', url: url, body: menu}
    }

    // 获取菜单
    getMenu (token) {
        const url = api.menu.get + 'access_token=' + token

        return {url: url}
    }

    // 删除菜单
    delMenu (token) {
        const url = api.menu.del + 'access_token=' + token

        return {url: url}
    }

    addConditionMenu (token, menu, rule) {
        const url = api.menu.addCondition + 'access_token=' + token
        const form = {
          button: menu,
          matchrule: rule
        }

        return {method: 'POST', url: url, body: form}
    }

    delConditionMenu (token, menuId) {
        const url = api.menu.delCondition + 'access_token=' + token
        const form = {
          menuid: menuId
        }

        return {method: 'POST', url: url, body: form}
    }

    getCurrentMenuInfo (token) {
        const url = api.menu.getInfo + 'access_token=' + token

        return {url: url}
    }

    sign (ticket, url) {
        return sign(ticket, url)
    }

}