import cheerio from 'cheerio'
import rp from 'request-promise'
import R from 'ramda'
import { writeFileSync } from 'fs'
import Agent from 'socks5-http-client/lib/Agent'

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

    // console.log($('table.cast_list tr.odd'))

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

getIMDBCharacters()