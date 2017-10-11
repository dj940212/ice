import qiniu from 'qiniu'
import config from '../config'
import {exec} from 'shelljs'

// qiniu.conf.ACCESS_KEY = config.qiniu.AK
// qiniu.conf.SECRET_KEY = config.qiniu.SK

const bucket = 'image-hosting'

export const fetchImage = async (url, key) => {
    // const client = new qiniu.rs.Client()

    return new Promise((resolve, reject) => {
        // client.fetch(url, bucket, key, (err, ret) => {
        //     if (err) reject(err)
        //     else resolve(ret)
        // })
        let bash = `qshell fetch ${url} ${bucket} ${key}`
        // let child = exec(bash, {async: true})
        // child.stdout.on('data',data => {
        //     console.log(data)
        //     resolve(data)
        // })

        exec(bash, (code, stdout, stderr) => {
            if (stderr) return reject(stderr)
            if (stdout === 'Fetch error, 504 , xreqid:') return reject(stdout)

            resolve(stdout)
        })
    })
}
