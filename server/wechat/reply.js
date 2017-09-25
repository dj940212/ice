const tip = "我的卡丽熙"
export default async (ctx, next) => {
    const message = ctx.weixin

    console.log(message)

    ctx.body = tip 
}