---
title: 'Grails Spring Events Plugin'
date: 2010-05-28T13:27:00+0100
tags: asynchronous, events, spring, grails plugins
alias: post/42902966203/grails-spring-events-plugin
---

Following on from [my previous post][1] I've developed a Grails plugin that packages the asynchronous events behaviour up and adds some extra useful functionality.

<!-- more -->

In addition to the asynchronous event processing the plugin gives you:

* A _publishEvent_ method attached to all domain classes, controllers and services.
* A Hibernate session bound to the listener thread for the duration of the notification so that listeners can access lazy-loaded properties, etc.
* The ability to have a "retry policy" for certain types of failed notifications on individual listeners. This is particularly useful for listeners that do things like invoking external web-services that may be periodically unavailable.

To install the plugin just use:

    grails install-plugin spring-events

The code and some more detailed documentation is on [GitHub][2]. I'll be migrating the docs to the plugin's page on grails.org soon.

[1]: http://blog.freeside.co/post/42902948889/asynchronous-application-events-in-grails
[2]: http://github.com/robfletcher/grails-spring-events

