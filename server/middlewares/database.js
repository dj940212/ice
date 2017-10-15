import mongoose from 'mongoose'
import config from '../config'
import fs from 'fs'
import { resolve } from 'path'
import R from 'ramda'
import WikiHouse from 'schema/wikiHouse'
import WikiCharacter from 'schema/wikiCharacter'

const models = resolve(__dirname, '../database/schema')

fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*js$/))
  .forEach(file => require(resolve(models, file)))

// 替换成nmId
const formatData = R.map(i => {
  i._id = i.nmId

  return i
})

let wikiCharacters = require(resolve(__dirname, '../database/completeCharacters.json'))
let wikiHouses = require(resolve(__dirname, '../database/completeHouses.json'))

export default app => {
    mongoose.set('debug', true)

    mongoose.connect(config.db)

    mongoose.connection.on('disconnected', () => {
        mongoose.connect(config.db)
    })
    mongoose.connection.on('error', err => {
        console.log(err)
    })

    mongoose.connection.on('open', async ()=> {
        console.log('Connected to MongoDB',config.db)

        const existWikiHouse = await WikiHouse.find({}).exec()
        const existWikiCharacter = await WikiCharacter.find({}).exec()

        // 插入爬虫数据
        if (!existWikiHouse.length) WikiHouse.insertMany(wikiHouses)
        if (!existWikiCharacter.length) WikiCharacter.insertMany(wikiCharacters)
    })
}