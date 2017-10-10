import cheerio from 'cheerio'
import rp from 'request-promise'
import R from 'ramda'
import { writeFileSync } from 'fs'
import { resolve } from 'path'
import Agent from 'socks5-http-client/lib/Agent'

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

// 爬取卡司整容
export const getIMDBCharacters = async () => {
    const options = {
        uri: 'http://www.imdb.com/title/tt0944947/fullcredits?ref_=tt_cl_sm#cast',
        // agentClass: Agent,
        // agentOptions: {
        //     socksHost: 'localhost',
        //     socksPort: 50862
        // },
        transform: body => cheerio.load(body)
    }
    let photos = []
    const $ = await rp(options)

     $('table.cast_list tr.odd, tr.even').each(function() {
        const nmIdDom = $(this).find('td.itemprop a')
        const nmId = nmIdDom.attr('href')
        const characterDom = $(this).find('td.character a')
        const name = characterDom.text()
        const chId = characterDom.attr('href')
        const playedByDom = $(this).find('td.itemprop span.itemprop')
        const playedBy = playedByDom.text()

        photos.push({
            nmId,
            chId,
            name,
            playedBy
        })
        console.log(nmId, chId, name, playedBy)
    })

    console.log('共拿到 '+ photos.length+ ' 条数据')
    const fn = R.compose(
        R.map(photo => {
            const reg1 = /\/name\/(.*?)\/\?ref/
            const reg2 = /\/character\/(.*?)\/\?ref/

            const match1 = photo.nmId.match(reg1)
            const match2 = photo.chId.match(reg2)

            photo.nmId = match1[1]
            photo.chId = match2[1]

            return photo
        }),
            
        R.filter(photo => photo.playedBy && photo.name && photo.nmId && photo.chId)
    )

    photos = fn(photos)

    console.log('清洗后剩余' + photos.length+ ' 条数据')
    writeFileSync('./imdb.json', JSON.stringify(photos, null, 2), 'utf8')
}

const fetchIMDbProfile = async (url) => {
    const options = {
        uri: url,
        // agentClass: Agent,
        // agentOptions: {
        //     socksHost: 'localhost',
        //     socksPort: 50862
        // },
        transform: body => cheerio.load(body)
    }

    const $ = await rp(options)

    const img = $('a[name="headshot"] img')

    let src = img.attr('src')

    if (src) {
        src = src.split('_V1').shift()
        src += '_V1.jpg'
    }

    return src
}

// 爬取角色头像
export const getIMDbProfile = async (url) => {
    const characters = require(resolve(__dirname, '../../imdbCharacters.json'))

    console.log(characters.length)
    for (let i = 0; i < characters.length; i++) {
        if (!characters[i].profile) {
            const url = `http://www.imdb.com/character/${characters[i].chId}/`
            console.log('正在爬取 '+characters[i].name)
            const src = await fetchIMDbProfile(url)
            console.log('已经爬到 '+ src)
            
            characters[i].profile = src

            writeFileSync('./imdbCharacters.json', JSON.stringify(characters, null, 2), 'utf8')

            await sleep(500)
        }
    }
}



const checkIMDbProfile = () => {
    const characters = require(resolve(__dirname, '../../imdbCharacters.json'))
    const newCharacters = []

    characters.forEach((item) => {
        if (item.profile) {
           newCharacters.push(item)
        }
    })
    writeFileSync('./validCharacters.json', JSON.stringify(newCharacters, null, 2), 'utf8')
}

const fetchIMDbImages = async (url) => {
    const options = {
        uri: url,
        transform: body => cheerio.load(body)
    }

    const $ = await rp(options)
    let images = []


    $('div.media_index_thumb_list a img').each(function () {
        let src = $(this).attr('src')

        if (src) {
          src = src.split('_V1').shift()
          src += '_V1.jpg'
          images.push(src)
        }
    })

    return images
}

// 爬取角色剧照
export const getIMDbImages = async (url) => {
    const characters = require(resolve(__dirname, '../../validCharacters.json'))

    console.log(characters.length)
    for (let i = 0; i < characters.length; i++) {
        if (!characters[i].images) {
            const url = `http://www.imdb.com/character/${characters[i].chId}/`
            console.log('正在爬取 '+characters[i].name)
            const src = await fetchIMDbImages(url)
            console.log('已经爬到 '+ images.length)
            
            characters[i].images = images

            writeFileSync('./fullCharacters.json', JSON.stringify(characters, null, 2), 'utf8')

            await sleep(500)
        }
    }
}






getIMDbProfile()