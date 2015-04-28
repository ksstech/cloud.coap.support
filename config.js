module.exports = {
    administrator: {
        uuid: 'IMACS',
        token: 'w@l!@y5!'
    },
    http_port: process.env.PORT || 3000,
    coap_port: 5683,
    mongodb: {
        host: 'ossewawiel.dyndns.org',
        port: 27017,
        database: 'disona',
        username: 'disona',
        password: 'passw0rd'
    },
    mqtt: {
      host: 'ossewawiel.dyndns.org',
      port: 1883,
      username: 'admin',
      password: 'admin',
    },
    allow_reregister: true
};