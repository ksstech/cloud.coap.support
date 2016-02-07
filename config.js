var config = {
    influxDB: {
      host: 'bam02.ushauri.co.za',
      port: 8086,
      senseDB: 'sense',
      alertDB: 'alert'
    },
    amqp: {
      host: 'bam01.ushauri.co.za',
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
