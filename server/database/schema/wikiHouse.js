const mongoose = require('mongoose')
const { Schema } = mongoose
const Mixed = Schema.Types.Mixed

const WikiHouseSchema = new Schema({
  name: String,
  cname: String,
  words: String,
  intro: String,
  cover: String,
  wikiId: Number,
  sections: Mixed,
  swornMembers: [
    {
      character: { type: String, ref: 'WikiCharacter' },
      text: String
    }
  ]
})

const House = mongoose.model('WikiHouse', WikiHouseSchema)
export default House
