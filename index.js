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
	constructor({ nsq = 'http://localhost:4150', topic = 'relayed', event = 'nsq' })
	{
		const parsed = url.parse(nsq);
		this.nsq = new Squeaky({ host: parsed.hostname, port: parsed.port || 4150 });
		this.topic = topic;
		this.eventName = event;
		this.logger = bole(event);
		this.handler = msg => this.handleEvent(msg);
		process.on(event, this.handler);
	}

	handleEvent(message)
	{
		this.nsq.publish(this.topic, message).then(resp =>
		{
			// silence on success
			this.logger.debug(resp, message);
		}).catch(err =>
		{
			this.logger.error('unexpected problem posting to nsq; dropping event on the floor');
			this.logger.error(err);
		});
	}

	close()
	{
		this.nsq.close()
		process.removeListener(this.eventName, this.handler);
	}
}

createRelayer.NSQRelayer = NSQRelayer;
