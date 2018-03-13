'use strict';

const
	bole    = require('bole'),
	Squeaky = require('squeaky'),
	url     = require('url')
;

module.exports = createRelayer;

function createRelayer(opts = {})
{
	return new NSQRelayer(opts);
}

class NSQRelayer
{
	constructor({ nsq = 'http://127.0.0.1:4151', topic = 'relayed', event = 'nsq', relays = null })
	{
		const parsed = url.parse(nsq);
		this.dest = nsq;
		this.nsq = new Squeaky({ host: parsed.hostname, port: parsed.port || 4150 });
		this.logger = bole('nsq-relay');
		this.events = {};

		if (Array.isArray(relays) && relays.length > 0)
		{
			relays.forEach(topic =>
			{
				const fn = msg => this.handleEvent(topic, msg);
				process.on(topic, fn);
				this.events[topic] = fn;
			});
		}
		else
		{
			const fn = msg => this.handleEvent(topic, msg);
			process.on(event, fn);
			this.events[event] = fn;
		}
	}

	handleEvent(topic, message)
	{
		this.nsq.publish(topic, message).then(resp =>
		{
			// silence on success
			this.logger.debug(resp, message);
		}).catch(err =>
		{
			this.logger.warn(`error ${err.message} posting to ${topic} at ${this.dest}; dropping message on the floor	`);
		});
	}

	close()
	{
		Object.keys(this.events).forEach(evt =>
		{
			process.removeListener(evt, this.events[evt]);
		});
		this.nsq.close();
	}
}

createRelayer.NSQRelayer = NSQRelayer;
