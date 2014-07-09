---
title: 'JSON Rendering Your Classes'
date: 2009-08-12T06:06:00+0100
tags: json, joda time
alias: post/42902545073/json-rendering-your-classes
---

It turns out adding custom JSON renderers for your own types to Grails is really easy. Since I habitually use [Joda Time][1] instead of the horrible `java.util.Date` and even more horrible `java.util.Calendar` I need to be able to render classes such as Joda's `DateTime` as JSON so that domain objects with fields of those types will convert properly.

<!-- more -->

Implementing a renderer for a type is as easy as this: [`DateTimeMarshaller.java`][2]. After that all that's required is to register the new renderer in `BootStrap.groovy` or some other appropriate spot with:

    grails.converters.JSON.registerObjectMarshaller new DateTimeMarshaller()

I'll be adding this to the next release of the [Joda Time Plugin][3] so that it's completely transparent.

_**Update:**_ Actually it's even easier than I thought. This being Groovy you can just use closures like so:

    JSON.registerObjectMarshaller(DateTime) {
        return it?.toString("yyyy-MM-dd'T'HH:mm:ss'Z'")
    }

_**Update:**_ This is now built in to version 0.5 of the [Joda Time Plugin][4].

[1]: http://joda-time.sourceforge.net/
[2]: http://gist.github.com/166335
[3]: http://grails.org/plugin/joda-time
[4]: http://grails.org/plugin/joda-time

