---
title: 'Testing with embedded Vert.x'
date: 2012-05-09T00:47:00+0100
tags: vertx, testing, spock
alias: post/41774683415/testing-with-embedded-vertx/
---

I blogged recently about [using Spock to test APIs that use callbacks][prevblog]. The post came out of some work I've been doing with [Vert.x][vertx]. Although the tests I wrote worked, I found them rather mock-heavy and felt I wasn't using the Vert.x API as idiomatically as I could have been.

Next I tried [creating an embedded `Vertx` instance][vertx-embedded] in my test and sending messages to my component over the real event bus. This is surprisingly easy and worked well.

<!-- more -->

The embedded API doesn't allow you to deploy _verticles_ or start [busmods][busmods] as they are intended to run in isolated classloaders. You _can_ use the event bus, though.

For example consider the following component that handles event bus messages and looks up documents using Vert.x's [Mongo DB persistor][mongo-persistor]:

    #!groovy
    class MyComponent {
        EventBus eventBus

        void read(Message message) {
            eventBus.send('mongo.persistor', [action: 'find-one', matcher: [id: message.body.id]]) { reply ->
                if (reply.body.status == 'ok') {
                    if (reply.body.results) message.reply status: 'found', title: reply.body.results[0].title
                    else message.reply status: 'not-found'
                } else {
                    message.reply status: 'error', message: 'o noes something went wrong'
                }
            }
        }
    }

To test this first I initialized the Vert.x instance and registered my component as a handler on the event bus. I'm waiting until Vert.x calls back to indicate that the handler is registered successfully then storing the handler's _id_ so that I can easily clean it up after the test:

    #!groovy
    @Shared def vertx = Vertx.newVertx()
    def component = new MyComponent(eventBus: vertx.eventBus)
    def handlerIds = new Stack()

    void setup() {
        registerHandler 'my.component', component.&read
    }

    private void registerHandler(String address, Closure handler) {
        def readyLatch = new CountDownLatch(1)
        handlerIds << vertx.eventBus.registerHandler(address, handler) {
            readyLatch.countDown()
        }
        assert readyLatch.await(1, SECONDS)
    }

    void cleanup() {
        while (!handlerIds.empty()) {
            vertx.eventBus.unregisterSimpleHandler handlerIds.pop()
        }
    }

Vert.x's Groovy API uses closures for all handlers on the event bus so I've used [Groovy's `.&` operator][method-to-closure] to turn the method on my component into a closure.

Then I added a [Spock Mock][spock-mocks] to represent the Mongo DB persistor that my component will send messages to. This also needs to be registered on the event bus:

    #!groovy
    def persistor = Mock(Handler)

    void setup() {
        // ...
        registerHandler 'mongo.persistor', persistor.&handle
    }

Finally, a feature method to test what happens when the requested document does not exist in the Mongo DB datastore:

    #!groovy
    void 'read calls back with not-found status if there is nothing in the database'() {
        given:
        persistor.handle(_) >> { Message message ->
            message.reply status: 'ok', results: []
        }

        and:
        def reply = new BlockingVariable<Message>()

        when:
        vertx.eventBus.send 'my.component', [id: '1234'], reply.&set

        then:
        reply.get().body.status == 'not-found'
    }

The mock persistor executes its own callback. Realistically I'd want to use a better matcher for the persistor mock there, but I've used a wildcard for simplicity in the example. Note that the `reply` spy is an instance of `spock.util.concurrent.BlockingVariable` as I need to ensure the assertion blocks until the callback is actually executed.

This is fine for scenarios where I'm validating the component's interaction with the persistor. For more complex tests for things like data integrity I'm going to need to figure out a way to wire up real collaborators like the Mongo persistor rather than using a mock. If I figure out a neat way of doing so I'll post again.

[prevblog]:http://blog.freeside.co/post/41774661851/testing-callbacks-with-spock-mocks
[vertx]:http://vertx.io/
[busmods]:http://vertx.io/manual.html#busmods
[vertx-embedded]:http://vertx.io/manual.html#vertx-embedded
[mongo-persistor]:http://vertx.io/mods_manual.html#mongodb-persistor
[method-to-closure]:http://mrhaki.blogspot.co.uk/2009/08/groovy-goodness-turn-methods-into.html
[spock-mocks]:https://code.google.com/p/spock/wiki/Interactions

