var config = {
    http_port: process.env.PORT || 3000,
    coap_port: 5683,
    mqtt: {
      host: '197.96.138.188',
      port: 1883,
      username: 'admin',
      password: 'admin',
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
    },
    allow_reregister: true,
    rules_path: '/home/administrator/rules/',
    ackTimeout: 2, // seconds
	ackRandomFactor: 1.5,
	maxRetransmit: 4,
	nstart: 1,
	defaultLeisure: 5,
	probingRate: 1, // byte/seconds
	maxLatency: 100 // seconds

};
config.maxTransmitSpan = config.ackTimeout * ((Math.pow(2, config.maxRetransmit)) - 1) * config.ackRandomFactor
config.maxTransmitWait = config.ackTimeout * (Math.pow(2, config.maxRetransmit + 1) - 1) * config.ackRandomFactor
config.processingDelay = config.ackTimeout
config.maxRTT = 2 * config.maxLatency + config.processingDelay
config.exchangeLifetime = config.maxTransmitSpan + config.maxRTT

module.exports = config;
