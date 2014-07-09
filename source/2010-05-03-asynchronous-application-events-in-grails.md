---
title: 'Asynchronous application events in Grails'
date: 2010-05-03T21:59:00+0100
tags: asynchronous, events, spring
alias: ["post/42902948889/asynchronous-application-events-in-grails/"]
---

On the project for my current client we've been using JMS in a rather na&iuml;ve way for some time now. We've also experienced a certain amount of pain getting JMS and ActiveMQ configured correctly. However, all we're really using JMS for is asynchronous event broadcasting. Essentially we have a handful actions such as flushing hardware caches and notifying external systems that take place when a document changes. We don't want these things blocking the request thread when users save data.

<!-- more -->

After wrestling with JMS one too many times we decided to take a look at Spring's event framework instead. It turns out it's extremely easy to use for these kinds of asynchronous notifications in a Grails application.

Essentially any artefact can publish an event to the Spring application context. A simple publishing service can be implemented like this:

    import org.springframework.context.*

    class EventService implements ApplicationContextAware {

        boolean transactional = false

        ApplicationContext applicationContext

        void publish(ApplicationEvent event) {
            println "Raising event '$event' in thread ${Thread.currentThread().id}"
            applicationContext.publishEvent(event)
        }
    }

So a Grails domain class can then do something like this:

    def eventService

    void afterInsert() {
        eventService.publish(new DocumentEvent(this, "created"))
    }

    void afterUpdate() {
        eventService.publish(new DocumentEvent(this, "updated"))
    }

    void afterDelete() {
        eventService.publish(new DocumentEvent(this, "deleted"))
    }

Grails services make ideal [_ApplicationListener_][2] implementations. As services are singleton Spring beans they are automatically discovered by Spring's event system without any configuration required. For example:

    import org.springframework.context.*

    class EventLoggingService implements ApplicationListener<DocumentEvent> {

        boolean transactional = false

        void onApplicationEvent(DocumentEvent event) {
            println "Recieved event '$event' in thread ${Thread.currentThread().id}"
        }
    }

Of course, multiple listeners can respond to the same events.

If you run the code you will notice that by default Spring's event system processes events synchronously. The _EventService_ and _ApplicationListener_ will print out the same Thread _id_. This is not ideal if any of the listener implementations might take any time. Luckily it's easy to override the [_ApplicationEventMulticaster_][3] bean in `resources.groovy` so that it uses a thread pool:

    import java.util.concurrent.*
    import org.springframework.context.event.*

    beans = {
        applicationEventMulticaster(SimpleApplicationEventMulticaster) {
            taskExecutor = Executors.newCachedThreadPool()
        }
    }

Running the code again will show the event being published in one thread and consumed in another. If you have multiple listeners each one will be executed in its own thread.

Oddly, I would have thought it was possible to override the _taskExecutor_ property of the default _ApplicationEventMulticaster_ in `Config.groovy` using Grails' [property override configuration][1], but I found the following didn't work:

    beans {
        applicationEventMulticaster {
            taskExecutor = Executors.newCachedThreadPool()
        }
    }

[1]: http://grails.org/doc/latest/guide/14.%20Grails%20and%20Spring.html#14.6%20Property%20Override%20Configuration "Property Override Configuration in the Grails User Guide"
[2]: http://static.springsource.org/spring/docs/3.0.x/javadoc-api/org/springframework/context/ApplicationListener.html
[3]: http://static.springsource.org/spring/docs/3.0.x/javadoc-api/org/springframework/context/event/ApplicationEventMulticaster.html

