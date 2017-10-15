import Services from './services'
import axios from 'axios'

export default {
	getWechatSignature({ commit }, url) {
		return Services.getWechatSignature(url)
	},

	getUserByOAuth({ commit }, url) {
		return Services.getUserByOAuth(url)
	},

	async fetchHouses({ state }) {
		const res = await Services.fetchHouses()

		state.houses = res.data.data

		console.log("houses", res.data)

		return res
	},

	async showHouse ({ state }, _id) {
	    if (_id === state.currentHouse._id) return

	    const res = await Services.fetchHouse(_id)

	    state.currentHouse = res.data.data

	    console.log('currentHouse', res.data.data)
	    return res
	 },

	async fetchCharacters({ state }) {
		const res = await Services.fetchCharacters()

		state.characters = res.data.data

		console.log("characters", res.data.data)

		return res
	},

	async showCharacter ({ state }, _id) {
		console.log("12312423")
	    if (_id === state.currentCharacter._id) return

	    const res = await Services.fetchCharacter(_id)

	    console.log("currentCharacter",res.data)
	    state.currentCharacter = res.data.data

	    return res
	},

	// 获取商品列表
  async fetchProducts ({ state }) {
    const res = await Services.fetchProducts()

    state.products = res.data.data
    console.log(res.data.data)

    return res
  },

  // 获取商品
  async showProduct ({ state }, _id) {
    if (_id === state.currentProduct._id) return

    const res = await Services.fetchProduct(_id)
    console.log(res.data)
    state.currentProduct = res.data.data

    return res
  },

  // 保存商品
  async saveProduct ({ state, dispatch }, product) {
    await axios.post('/api/products', product)

    let res = await dispatch('fetchProducts')

    return res.data.data
  },

  // 修改商品
  async putProduct ({ state, dispatch }, product) {
    await axios.put('/api/products', product)
    let res = await dispatch('fetchProducts')

    return res.data.data
  },

  // 删除商品
  async deleteProduct ({ state, dispatch }, product) {
    await axios.delete(`/api/products/${product._id}`)
    let res = await dispatch('fetchProducts')

    return res.data.data
  },

}