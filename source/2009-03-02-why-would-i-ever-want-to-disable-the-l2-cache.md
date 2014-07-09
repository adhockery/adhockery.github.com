---
title: 'Why would I ever want to disable the L2 cache?'
date: 2009-03-02T17:28:00+0000
tags: caching, hibernate, gorm
alias: ["post/42902311928/why-would-i-ever-want-to-disable-the-l2-cache/"]
---

This question came up when pairing last week. We were going through our code-base adding the [cache directive][1] to a bunch of our domain classes. Grails is all about sensible defaults and it seems slightly odd that the level 2 cache is configured by default in `DataSource.groovy` but not actually _used_ unless `cache(true)` is added to the mapping closure in each domain class. I wonder if anyone has any ideas why it might ever be a bad idea to use the L2 cache?

<!-- more -->

The only scenario I can come up with is situations where updates are made direct to the DB, bypassing Hibernate. This is, I would think, pretty rare (we do it for some rather na&iuml;ve hit tracking and for voting on polls). Sure, in this circumstance the L2 cache will likely give you stale results. However, it's very much the exception rather than the rule.

Most other objections I've heard have been some variety of worry about caches eating up vast amounts of heap space and crashing the JVM (which is why cache implementations like [ehcache][2] use time-based and LRU eviction).

Oh, and yeah, we did have some issues with our changes but most seem to be to do with [cruft][3] and [tech debt][4] in our code (mostly now-redundant workarounds to GORM issues from older releases of Grails).

[1]: http://grails.org/doc/1.1.x/ref/Database%20Mapping/cache.html
[2]: http://ehcache.sourceforge.net/
[3]: http://www.catb.org/jargon/html/C/cruft.html
[4]: http://www.think-box.co.uk/blog/2005/11/repaying-technical-debt.html
