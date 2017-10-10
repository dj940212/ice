import { resolve } from 'path'
import R from 'ramda'
import {find} from 'lodash'
import {writeFileSync} from 'fs'

const characters = require(resolve(__dirname, '../../characters.json'))
const imdbData = require(resolve(__dirname, '../../imdb.json'))

const findNameInAPI = (item) => {
    return find(characters, {
        name: item.name
    })
}

const findPlayedByInAPI = (item) => {
    return find(characters, i => {
        return i.playedBy.includes(item.playedBy)
    })
}

let validData = R.filter(
    i => findNameInAPI(i) && findPlayedByInAPI(i)
)

const IMDB = validData(imdbData)

console.log(IMDB.length)

writeFileSync('./wikiCharacters.json', JSON.stringify(IMDB, null, 2), 'utf8')