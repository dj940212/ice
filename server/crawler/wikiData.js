import rp from 'request-promise'
import _ from 'lodash'
import { writeFileSync } from 'fs'
import R from 'ramda'
import { resolve } from 'path'

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

// 获取wiki词条id
const getWikiId = async data => {
  const query = data.name || data.cname
  const url = `http://zh.asoiaf.wikia.com/api/v1/Search/List?query=${encodeURI(query)}`
  let res

  try {
    res await rp(url)
  } catch (e) {
    console.log(e)
  }

  res = JSON.parse(res)
  res = res.items[0]

  console.log(res.id)

  return R.merge(data, res)
}

// 获取词条详细内容
const getWikiDetail = async data => {
  const { id } = data
  const url = `http://zh.asoiaf.wikia.com/api/v1/Articles/AsSimpleJson?id=${id}`
  let res

  try {
    res = await rp(url)
  } catch (e) {
    console.log(e)
  }

  res = JSON.parse(res)

  return R.merge(data, res)
}