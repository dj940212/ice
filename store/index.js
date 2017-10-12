import Vuex from 'vuex'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'

const createStore = () => {
	return new Vuex.Store({
		state: {
			imageCDN: 'http://osmai097y.bkt.clouddn.com/',
			houses: [],
			cities: [],
			characters: [],
			currentHouse: {}
		},
		getters,
		actions,
		mutations
	})
}

export default createStore