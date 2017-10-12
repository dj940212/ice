import axios from 'axios'

const baseUrl = ''
const apiUrl = 'http://rapapi.org/mockjsdata/26866'

class Services {
	getWechatSignature(url) {
		return axios.get(`${baseUrl}/wechat-signature?url=${url}`)
	}

	getUserByOAuth(url) {
		return axios.get(`${baseUrl}/wechat-oauth?url=${url}`)
	}

	fetchHouses() {
		return axios.get(`${baseUrl}/wiki/houses`)
	}


	fetchCharacters() {
		return axios.get(`${baseUrl}/wiki/characters`)
	}

	fetchHouse(id) {
		return axios.get(`${baseUrl}/wiki/houses/${id}`)
	}


}

export default new Services()