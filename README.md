# nsq-relayer

You emit events structured in a specific way and this tool posts them all to its configured nsq instance.

```js
const createRelayer = require('nsq-relayer');

const relayer = createRelayer({
	topic: 'foozle',
	nsq: 'http://localhost:5141',
	event: 'event-to-listen-for'
});

// later on
process.emit('event-to-listen-for', { name: 'my-little-message', type: 'cutie-mark' });
// the relayer will then post this to nsq for us with zero effort
```

## Configuration

TBD.

## Notes

No attempt is made to retry failed event posts.

Each event is posted as it arrives, without batching. You might want to batch if you're posting many events per second.

## Licence

ISC.
