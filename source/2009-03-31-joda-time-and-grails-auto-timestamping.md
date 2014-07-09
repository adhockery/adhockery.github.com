---
title: 'Joda-Time and Grails Auto-Timestamping'
date: 2009-03-31T14:55:00+0100
tags: gorm, joda time, testing
alias: post/42902363843/joda-time-and-grails-auto-timestamping/
---

The [Joda-Time Plugin docs][1] state that [Grails' auto-timestamping][2] works with Joda-Time properties which is the case. However, when testing it can be useful to take advantage of Joda Time's [`DateTimeUtils`][3] class to mock the current time. This enables you to have new `DateTime` objects, for example, use a predictable timestamp. Unfortunately it doesn't play nicely with Grails' auto-timestamping which under the covers uses `System.currentTimeMillis()`.

<!-- more -->

There are a couple of solutions to this. You can disable the auto-timestamping and define your own `beforeInsert` event which enables you to use [`DateTimeUtils.setCurrentMillisFixed`][4]. For example:

    static mapping = {
        autoTimestamp false
    }

    def beforeInsert = {
        dateCreated = new DateTime()
    }

The other option would be to mock out the value returned by `System.currentTimeMillis()`. This has the advantage of meaning you don't have to add code to your domain class to enable tests to work, but on the other hand it's all to easy to have such meta class modifications leak from test to test by not being torn down properly.

On a related note the next release of the Joda-Time plugin will bind additional methods to `DateTimeUtils` to scope mocking of the current timestamp, for example:

    DateTimeUtils.withCurrentMillisFixed(aLong) {
        // do some stuff that requires a mocked current time
    }

No more forgetting to call `DateTimeUtils.setCurrentMillisSystem()` in your `tearDown` method!

[1]: http://grails.org/JodaTime+Plugin
[2]: http://grails.org/doc/1.1.x/guide/5.%20Object%20Relational%20Mapping%20(GORM).html#5.5.1%20Events%20and%20Auto%20Timestamping
[3]: http://joda-time.sourceforge.net/api-release/org/joda/time/DateTimeUtils.html
[4]: http://joda-time.sourceforge.net/api-release/org/joda/time/DateTimeUtils.html#setCurrentMillisFixed(long)
