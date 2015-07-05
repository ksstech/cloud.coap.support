/**
 * New node file
 */

var settings = {
	ackTimeout: 2, // seconds
	ackRandomFactor: 1.5,
	maxRetransmit: 4,
	nstart: 1,
	defaultLeisure: 5,
	probingRate: 1, // byte/seconds
	maxLatency: 100 // seconds
}

settings.maxTransmitSpan = settings.ackTimeout * ((Math.pow(2, settings.maxRetransmit)) - 1) * settings.ackRandomFactor
settings.maxTransmitWait = settings.ackTimeout * (Math.pow(2, settings.maxRetransmit + 1) - 1) * settings.ackRandomFactor
settings.processingDelay = settings.ackTimeout
settings.maxRTT = 2 * settings.maxLatency + settings.processingDelay
settings.exchangeLifetime = settings.maxTransmitSpan + settings.maxRTT

module.exports = settings;
