import Vuex from 'vuex'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'

const createStore = () => {
	return new Vuex.Store({
		state: {
			imageCDN: 'http://osmai097y.bkt.clouddn.com/',
			myImageCDN: 'http://image.dingjian.name/',
			houses: [],
			cities: [],
			characters: [],
			character: {},
			currentHouse: {},
			currentCharacter: {},
			products: [],
			currentProduct: [],
			user: null,
			authUser: null,
			character: null,
			characters: []
		},
		getters,
		actions,
		mutations
	})
}

export default createStore