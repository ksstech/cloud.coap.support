var config = {
  logging: {
      console: true,
      file: true
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
    }
};


module.exports = config;
