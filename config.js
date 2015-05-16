module.exports = {
    administrator: {
        uuid: 'IMACS',
        token: 'w@l!@y5!'
    },
    http_port: process.env.PORT || 3000,
    coap_port: 5683,
    mongodb: {
        host: 'bam01.ushauri.co.za',
        port: 27017,
        database: 'disona',
        username: 'disonaOwner',
        password: 'passw0rd'
    },
    mqtt: {
      host: 'bam01.ushauri.co.za',
      port: 1883,
      username: 'admin',
      password: 'admin',
    },
    logging: {
        console: true,
        file: true
    },
    allow_reregister: true
};