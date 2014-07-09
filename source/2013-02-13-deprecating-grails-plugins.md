---
title: 'Deprecating Grails plugins'
date: 2013-02-13T16:21:30+0000
tags: grails plugins
alias: ["post/43006835840/deprecating-grails-plugins/"]
---

I've written a number of Grails plugins and the fact is that some of them are effectively unsupported. I've only got so much time & I'm juggling work, family, conference speaking, my own projects and open source. Any plugin development I do is going to be driven by the requirements of work or other projects, so even those plugins I still consider as supported might not get updated as often as some people would like.

<!-- more -->

I'm no longer supporting…

* [The Selenium RC plugin][5]. It's based on Selenium 1 which is discontinuted. I contributed to [Geb][11] which is based on Selenium 2 and is actively supported by [Luke Daley][6] & [Marcin Erdmann][7]. You should consider using that.
* [The Springcache plugin][2]. It's effectively superseded by the new [Cache plugin][10] which is supported by SpringSource.
* [The Spring Events plugin][3]. It does what I need it to do and there are more full-blown solutions such as Rabbit MQ or the platform core events plugin if you need something more.

I'm hoping to continue with…

* [The Fields plugin][1]. It seems popular & certainly caters to a pain point. That said I'm not using it directly on anything else I'm working on so it's not a huge priority for me.
* [The Joda Time plugin][4]. I think it's important and deserves to have first-class support in Grails. The `java.util.Date` and `java.util.Calendar` classes are, to put it mildly, problematic for a whole host of reasons. I'm currently experiencing some frustration trying to integrate the plugin with the unit testing framework in Grails 2+ but I would like to get a new version of the plugin out at some point.
* [Angular scaffolding][8]. This is as-yet unreleased but I'd like to work some more on it.
* [Betamax][9]. I've done a bunch of work on the next version but have got sidetracked with other things recently. I hope to pick this up again soon.

If anyone wants to take over my abandoned projects, please get in touch. I'll be happy to hand you the keys to the GitHub repos.

[1]:http://freeside.co/grails-fields/
[2]:http://gpc.github.com/grails-springcache/docs/guide/index.html
[3]:http://grails.org/plugin/spring-events
[4]:http://gpc.github.com/grails-joda-time/
[5]:http://freeside.co/grails-selenium-rc/docs/manual/index.html
[6]:http://ldaley.com/
[7]:http://blog.proxerd.pl/
[8]:http://git.io/grails-ng
[9]:http://freeside.co/betamax
[10]:http://grails-plugins.github.com/grails-cache/docs/manual/
[11]:http://gebish.org/
