import WikiHouse from 'schema/wikiHouse'
import WikiCharacter from 'schema/wikiCharacter'

// 获取全部家族数据
export async function getHouses() {
  const data = await WikiHouse
    .find({})
    .populate({
      path: 'swornMembers.character',
      select: '_id name cname profile'
    })
    .exec()

  return data
}

// 获取单个家族数据
export async function getHouse (_id) {
  const data = await WikiHouse
    .findOne({
      _id: _id
    })
    .populate({
      path: 'swornMembers.character',
      select: '_id name profile cname nmId'
    })
    .exec()

  return data
}

// 获取全部人物数据
export async function getCharacters (limit = 20) {
  const data = await WikiCharacter
    .find({})
    .limit(Number(limit))
    .exec()

  return data
}

// 获取单个人物数据
export async function getCharacter (_id) {
  const data = await WikiCharacter
    .findOne({
      _id: _id
    })
    .exec()

  return data
}

