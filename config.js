module.exports = {
    http_port: process.env.PORT,
    https_port: 3006,
    coap_port: 5683,
    mongodb: "mongodb://" + process.env.IP + ":27017/disona",
    administrator :{
        uuid: 'IMACS',
        token: 'w@l!@y5!'
    }
}