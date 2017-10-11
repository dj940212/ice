import rp from 'request-promise'
import _ from 'lodash'
import { writeFileSync } from 'fs'
import Promise from 'bluebird'
import R from 'ramda'
import { resolve } from 'path'
import {fetchImage} from '../libs/qiniu'
import randomToken from 'random-token'
import config from '../config'

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

const normalizedContent = content => _.reduce(content, (acc, item) => {
  if (item.text) acc.push(item.text)

  if (item.elements && item.elements.length) {
    let _acc = normalizedContent(item.elements)
    acc = R.concat(acc, _acc)
  }
  return acc
}, [])


const normalizedSections = R.compose(
  R.nth(1),
  R.splitAt(1),
  R.map(
    i => ({
      level: i.level,
      title: i.title,
      content: normalizedContent(i.content)
    })
  )
)

// 获取wiki词条id
const getWikiId = async data => {
  let query = data.cname || data.name
  const url = `http://zh.asoiaf.wikia.com/api/v1/Search/List?query=${encodeURI(query)}`

  try {
    var res = await rp(url)
  } catch (e) {
    console.log('error:', e)
  }

  res = JSON.parse(res)
  res = res.items[0]

  console.log(query, ':', res.id, res.title)
  return R.merge(data, res)
}

// 获取词条详细内容
const getWikiDetail = async data => {
  const { id } = data
  let url = `http://zh.asoiaf.wikia.com/api/v1/Articles/AsSimpleJson?id=${id}`

  try {
    var res = await rp(url)
  } catch (e) {
    console.log('error:', e)
  }
  res = JSON.parse(res)
  console.log(id, 'done')

  const getCnameAndIntro = R.compose(
    i => ({
      cname: i.title,
      intro: R.map(R.prop(['text']))(i.content)
    }),
    R.pick(['title', 'content']),
    R.nth(0),
    R.filter(R.propEq('level', 1)),
    R.prop('sections')
  )

  const getLevel = R.compose(
    R.project(['title', 'content', 'level']),
    R.reject(R.propEq('title', '扩展阅读')),
    R.reject(R.propEq('title', '引用与注释')),
    R.filter(i => i.content.length),
    R.prop('sections')
  )

  let cnameAndIntro = getCnameAndIntro(res)
  let sections = getLevel(res)
  let _res = R.merge(data, getCnameAndIntro(res))

  sections = normalizedSections(sections)

  _res.sections = sections
  _res.wikiId = id

  return R.pick(['name', 'cname', 'playedBy', 'profile', 'images', 'nmId', 'chId', 'sections', 'intro', 'wikiId', 'words'], _res)
}

// 获取wiki中文信息
export const getWikiCharacters = async () => {
  let data = require(resolve(__dirname, '../../fullCharacters.json'))

  console.log(data.length)
  data = R.map(getWikiId, data)

  console.log('获取wikiId ', data[0])
  data = await Promise.all(data)
  data = R.map(getWikiDetail, data)
  data = await Promise.all(data)
  console.log('获取wiki详细资料 ', data[0])

  writeFileSync('./finalCharacters.json', JSON.stringify(data, null, 2), 'utf8')
}

export const fetchImageFromIMDb = async () => {
  let IMDbCharacters = require(resolve(__dirname, '../../finalCharacters.json'))
  IMDbCharacters = [IMDbCharacters[0]]

  IMDbCharacters = R.map(async item => {
    try {
      let key = `${item.nmId}/${randomToken(32)}`
      await fetchImage(item.profile, key)
      console.log(key, item.profile)
      console.log('upload done!')
      item.profile = key

      for (var i = 0; i < item.images.length; i++) {
        let _key = `${item.nmId}/${randomToken(32)}`

        await fetchImage(item.images[i], _key)

        console.log(_key,item.images[i])

        await sleep(100)

        item.images[i] ="http://image.dingjian.name/"+_key
      }

    } catch (e) {
      console.log(e)
    }

    return item
  })(IMDbCharacters)

  IMDbCharacters = await Promise.all(IMDbCharacters)
  console.log('fetchImagesFromA2Q done')
  writeFileSync('./completeCharacters.json', JSON.stringify(IMDbCharacters, null, 2), 'utf8')
}


fetchImageFromIMDb()