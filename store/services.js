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

	fetchCharacter(id) {
		return axios.get(`${baseUrl}/wiki/characters/${id}`)
	}

	fetchHouse(id) {
		return axios.get(`${baseUrl}/wiki/houses/${id}`)
	}

	fetchProducts () {
    return axios.get(`${baseUrl}/api/products`)
  }

  fetchProduct (id) {
    return axios.get(`${baseUrl}/api/products/${id}`)
  }


}

export default new Services()