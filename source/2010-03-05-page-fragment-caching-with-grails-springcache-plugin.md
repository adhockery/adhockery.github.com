---
title: 'Page fragment caching with Grails Springcache plugin'
date: 2010-03-05T06:42:00+0000
tags: grails plugins, caching
alias: ["post/42902846737/page-fragment-caching-with-grails-springcache-plugin/"]
---

Yesterday I released the new version of the Springcache plugin for Grails. The new feature this brings to the table is page fragment caching driven by annotations on controller actions. The feature is based on [EhCache Web][1] and is even simpler and more powerful than the full page caching [I blogged about recently][2]. With the page fragment caching feature you can:

* Define `@Cacheable` and `@CacheFlush` annotations on controller actions.
* Have SiteMesh decorate cached and uncached output alike.
* Use SiteMesh to mix dynamic page sections with cached sections.
* Use SiteMesh and `<g:include>` to have multiple areas of the page that are cached and flushed independently of one another.
* Cache the output of controller actions that use content negotiation separately according to the requested format.

There are some examples in the [plugin documentation][3] and the [plugin source code][4] has [a test project][5] with a variety of page fragment caching mechanisms used and tested.

[1]: http://ehcache.org/documentation/web_caching.html
[2]: http://blog.freeside.co/post/42902815893/full-page-caching-in-grails-with-ehcache-web
[3]: http://grails.org/plugin/springcache
[4]: http://github.com/robfletcher/grails-springcache
[5]: http://github.com/robfletcher/grails-springcache/tree/master/test/projects/content-caching/

