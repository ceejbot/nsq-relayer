# nsq-relayer

[![Build Status](https://travis-ci.org/ceejbot/nsq-relayer.svg?branch=master)](https://travis-ci.org/ceejbot/nsq-relayer)

You emit events from anywhere in your code and this module posts them all to its configured nsq instance.

```js
const createRelayer = require('nsq-relayer');

const relayer = createRelayer({
	nsq: 'http://localhost:4151',
	event: 'event-to-listen-for'
	topic: 'foozle',
});

// later on
process.emit('event-to-listen-for', { name: 'my-little-message', type: 'cutie-mark' });
// the relayer will then post this to nsq for us with zero effort
```

You can also pass an array of names to relay to more than one nsq topic. In this case, the nsq topic is the same as the event.

```js
const relayer = createRelayer({
	nsq: 'http://localhost:4151',
	relays: [ 'metric', 'email', 'cute-kitten' ],
});

// relay to `metric` nsq topic
process.emit('metric', { name: 'pony-count', value: 200 });
// relay to `email` nsq topic
process.emit('email', { to: 'friendship@example.com', subject: 'this example is long' });
// relay to `cute-kitten` nsq topic
process.emit('cute-kitten', { name: 'Mittens', color: 'orange tabby' });
```

For both configuration styles, the `nsq` field is a uri-formatted string. The host & port will be parsed out & passed to [squeaky](https://github.com/nlf/squeaky).

## Notes

No attempt is made to retry failed event posts.

Each event is posted as it arrives, without batching. You might want to batch if you're posting many events per second. Or use the TCP mode for squeaky, which opens a connection, keeps it open, and shoves data through.

## Licence

ISC.
