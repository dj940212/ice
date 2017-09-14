import mongoose from 'mongoose'
import config from '../config'
import Wechat from '../wechat-lib'
import Token from '../database/schema/token'

// const Token = mongoose.model('Token')
console.log(Token.getAccessToken)


const wechatConfig = {
    wechat: {
        appID: config.wechat.appID,
        appSecret: config.wechat.appSecret,
        token: config.wechat.token,
        getAccessToken: async () => await Token.getAccessToken(),
        saveAccessToken: async (data) => await Token.saveAccessToken(data)
    }
}

export const getWechat = () => {
    const wechatClient = new Wechat(wechatConfig.wechat)

    console.log("getWechat")

    return wechatClient
}
