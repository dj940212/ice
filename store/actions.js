import Services from './services'

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

	async fetchCharacters({ state }) {
		const res = await Services.fetchCharacters()

		state.characters = res.data.data

		console.log("characters", res.data.data)

		return res
	},

	async fetchCities({ state }) {
		const res = await Services.fetchCities()

		state.cities = res.data.data

		console.log("cities", res.data.data)

		return res
	},

	async fetchHouse({ state }, _id) {
		if (_id === state.currentHouse._id) return

		const res = await Services.fetchHouse(_id)

		state.currentHouse = res.data.data

		console.log("currentHouse",res)

		return res
	}
}