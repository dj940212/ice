const tip = "我的卡丽熙，欢迎来到河间地"
export default async (ctx, next) => {
    const message = ctx.weixin

    console.log("message:",message)

    if (message.MsgType === 'text') {
    	ctx.body = message.Content
    } else if (message.MsgType === 'event') {
    	if (message.Event === 'subscribe') {
    		ctx.body = tip
    	} else if (message.Event === 'unsubscribe') {
    		console.log('取关了')
    	} else if (message.Event === 'LOCATION') {
    		ctx.body = message.Latitude + ' : ' + message.Longitude
    	}
    } else if (message.MsgType === 'image') {
    	ctx.body = {
    		type: 'image',
    		mediaId: message.MediaId
    	}
    } else if (message.MsgType === 'voice') {
    	ctx.body = {
    		type: 'voice',
    		mediaId: message.MediaId
    	}
    } else if (message.MsgType === 'vedio') {
    	ctx.body = {
    		title: message.ThumbMediaId,
    		type: 'vedio',
    		mediaId: message.MediaId
    	}
    } else if (message.MsgType === 'location') {
    	ctx.body = message.Location_X + ' : ' + message.Location_Y + ' : ' + message.Label
    } else if (message.MsgType === 'link') {
    	ctx.body = [{
    		title: message.Title,
    		description: message.Description,
    		picUrl: 'http://mmbiz.qpic.cn/mmbiz_jpg/TApxeWshRXVSh9bC515hufSywLv1WTT5kmWvmWaNOPXvX4gN6ic3a9VmF1z2VY8IjWevMREYtvFMibvWYPribXe5w/0',
    		url: message.Url
    	}]
    }

    // ctx.body = "hello world"

}