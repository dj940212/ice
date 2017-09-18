import TokenMod from '../schema/token'

class Token {
    async getAccessToken() {
        const token = await TokenMod.findOne({
            name: 'access_token'
        })

        if (token && token.token) {
            token.access_token = token.token
        }

        return token
    }

    async saveAccessToken(data) {
        console.log("saveAccessToken")
        let token = await TokenMod.findOne({
            name: 'access_token'
        })

        if (token) {
            token.token = data.access_token
            token.expires_in = data.expires_in
        }else {
            token = new TokenMod({
                name: 'access_token',
                token: data.access_token,
                expires_in: data.expires_in
            })
        }

        await token.save()

        return data
    }
}

export default Token