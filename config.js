module.exports = {
    http_port: process.env.PORT || 3000,
    coap_port: 5683,
    mqtt: {
      host: '197.96.138.188',
      port: 1883,
      username: 'admin',
      password: 'admin',
    },
    logging: {
        console: true,
        file: true
    },
    allow_reregister: true,
    rules_path: '/home/administrator/rules/'
};