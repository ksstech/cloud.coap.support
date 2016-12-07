var config = {
    influxDB: {
      host: '197.96.136.162',
      port: 8086,
      senseDB: 'sense',
      alertDB: 'alert'
    },
    amqp: {
      host: '197.96.138.188',
      port: 5672,
      login: 'guest',
      password: 'guest',
      connectionTimeout: 10000,
      authMechanism: 'AMQPLAIN',
      vhost: '/',
      noDelay: true,
      ssl: { enabled : false}
    },
    logging: {
        console: true,
        file: true
    }
};

module.exports = config;
