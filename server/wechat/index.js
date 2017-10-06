import mongoose from 'mongoose'
import config from '../config'
import Wechat from '../wechat-lib'
import Token from '../database/schema/token'
import Ticket from '../database/schema/ticket'

console.log("TicketSchema",Ticket, Token)

const wechatConfig = {
    wechat: {
        appID: config.wechat.appID,
        appSecret: config.wechat.appSecret,
        token: config.wechat.token,
        getAccessToken: async () => await Token.getAccessToken(),
        saveAccessToken: async (data) => await Token.saveAccessToken(data),
        getTicket: async () => await Ticket.getTicket(),
        saveTicket: async (data) => await Ticket.saveTicket(data)
    }
}

export const getWechat = () => {
    const wechatClient = new Wechat(wechatConfig.wechat)

    return wechatClient
}
