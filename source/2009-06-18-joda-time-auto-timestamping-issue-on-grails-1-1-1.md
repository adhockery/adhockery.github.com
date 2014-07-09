---
title: 'Joda Time Auto-Timestamping Issue on Grails 1.1.1'
date: 2009-06-18T05:54:00+0100
tags: joda time, gorm
alias: ["post/42902495229/joda-time-auto-timestamping-issue-on-grails-1-1-1/"]
---

I've not upgraded most of my code to Grails 1.1.1 yet so I hadn't noticed this problem until it was [brought to my attention][1] by Manuel Vio on the [grails-user][2] mailing list.

I [raised a bug][3] a few days ago around the fact that GORM identifies Joda Time types (and presumably any non-default property type) as a one-to-one association. Up to now the only problem this caused me was that it means the [Joda Time plugin][4] has to do some slightly hacky tricks in the scaffolding templates to prevent crashes when Grails tries to render the properties as though they were associated domain instances only to find they have no _id_ property. However, on Grails 1.1.1 the bug is causing a nasty failure on auto-timestamping.

<!-- more -->

Under Grails 1.1 you can use a Joda _DateTime_ for an auto-timestamped fields:

    DateTime dateCreated
    DateTime lastUpdated

    static mapping = {
        dateCreated type: PersistentDateTime
        lastUpdated type: PersistentDateTime
    }

These behave exactly like the regular _Date_ fields with those names, i.e. they're [set automatically on save and update][5]. In Grails 1.1.1 the same class will fail on save with a _GroovyRuntimeException_ `Could not find matching constructor for: java.lang.Object(java.lang.Long)`.

There is a (somewhat strange) workaround - declare the timestamped fields as non-lazy!

    DateTime dateCreated
    DateTime lastUpdated

    static mapping = {
        dateCreated type: PersistentDateTime, lazy: false
        lastUpdated type: PersistentDateTime, lazy: false
    }

Digging into the Grails code a little I found that association properties have their getter wrapped in a lazy-loading proxy. Since GORM thinks Joda Time properties _are_ associations, this happens to them. The auto-timestamping code initialises the properties using `property.getType().newInstance(System.currentTimeMillis())`. Unfortunately, because _property_ is actually the lazy-load proxy rather than the real property `property.getType()` returns _Object_.

[1]: http://www.nabble.com/Problem-with-Joda-plugin-and-autotimestamping-td24068191.html#a24068191
[2]: http://grails.org/Mailing+lists
[3]: http://jira.codehaus.org/browse/GRAILS-4689
[4]: http://grails.org/plugin/joda-time
[5]: http://grails.org/doc/1.1/guide/single.html#5.5.1%20Events%20and%20Auto%20Timestamping

