module.exports = {
    administrator: {
        uuid: 'ossewawiel',
        token: 'w@l!@y5!'
    },
    http_port: process.env.PORT || 3000,
    coap_port: 5683,
    mongodb: "mongodb://" + process.env.IP + ":27017/disona",
    allow_reregister: true
};