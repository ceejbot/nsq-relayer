/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand        = require('must'),
	createRelayer = require('./index'),
	sinon         = require('sinon')
	;

describe('nsq-relayer', () =>
{
	it('exports a constructor', function()
	{
		createRelayer.must.be.a.function();
		const r = createRelayer();
		r.must.be.instanceof(createRelayer.NSQRelayer);
	});

	it('obeys its options', function()
	{
		const spy = sinon.spy(process, 'on');
		createRelayer({
			event: 'zaphod'
		});

		spy.called.must.be.true();
		spy.calledWith('zaphod').must.be.true();
		spy.restore();
	});

	it('defaults options when they are not provided', function()
	{
		const spy = sinon.spy(process, 'on');
		createRelayer();
		spy.called.must.be.true();
		spy.calledWith('nsq').must.be.true();
		spy.restore();
	});

	it('listens for the configured event', function(done)
	{
		const r = createRelayer();
		r.handleEvent = function handleEvent(topic, msg)
		{
			msg.must.be.an.object();
			msg.payload.must.equal('hello world');
			process.removeAllListeners('nsq');
			done();
		};
		process.emit('nsq', { payload: 'hello world'});
	});

	it('posts to nsq on receiving an event', function(done)
	{
		const r = createRelayer();
		const msg = { payload: 'hello world' };
		r.nsq.publish = function(topic, msg)
		{
			topic.must.equal('relayed');
			msg.must.be.an.object();
			msg.payload.must.equal('hello world');
			done();
		};
		process.emit('nsq', msg);
	});

	it('obeys an array relays option', function()
	{
		const relays = ['one', 'two', 'three'];
		const r = createRelayer({ relays });
		r.must.have.property('events');
		r.events.must.be.an.object();
		Object.keys(r.events).length.must.equal(relays.length);

		r.handleEvent = function handleEvent(topic, msg)
		{
			topic.must.equal(msg);
		};
		const spy = sinon.spy(r, 'handleEvent');

		relays.forEach(t => process.emit(t, t));
		spy.callCount.must.equal(relays.length);
		r.close();
	});

	it('logs on error', function(done)
	{
		const r = createRelayer();
		r.nsq.publish = function()
		{
			return Promise.reject(new Error('wat'));
		};
		const msg = { payload: 'hello world'};

		r.logger.warn = function(logline)
		{
			logline.must.match(/wat/);
			done();
		};
		r.handleEvent(msg);
	});

	it('exposes close()', function(done)
	{
		const r = createRelayer();
		var count = 0;
		r.nsq.close = function()
		{
			count++;
		};

		const eventCount = process.listeners('nsq').length;
		r.close();
		(process.listeners('nsq').length - eventCount).must.equal(-1);
		count.must.equal(1);
		done();
	});

	it('close() removes all listeners', function(done)
	{
		const relays = ['one', 'two', 'three'];
		const r = createRelayer({ relays });

		r.nsq.close = function()
		{
			process.listeners('one').length.must.equal(0);
			process.listeners('two').length.must.equal(0);
			process.listeners('three').length.must.equal(0);
			done();
		};

		r.close();
	});
});
