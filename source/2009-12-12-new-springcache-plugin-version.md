---
title: 'New Springcache Plugin Version'
date: 2009-12-12T16:49:00+0000
tags: grails plugins, caching
alias: post/42902718093/new-springcache-plugin-version/
---

After [saying it might take me a while][1] I got stuck in and rewrote the Springcache plugin from scratch. The new version is up now. The plugin now requires Grails 1.2.0-M3 or greater as it's reliant on Spring 3.0.

The plugin allows you to declare caching and flushing behaviour on service methods (well, any Spring bean methods, but services are typical) using `@Cacheable` and `@CacheFlush` annotations. This is really useful for service methods that perform long-running or expensive tasks such as retrieving data from web services, network resources, etc. The plugin is less appropriate for service methods that retrieve data using GORM/Hibernate as you could just use the 2nd level cache, although there's nothing stopping you doing so if it makes sense in your domain.

<!-- more -->

The documentation and source code are in the usual places. Here's a quick summary of the changes and new features:

* No longer depends on the (discontinued and non-Spring 3 compatible) [spring-modules-cache][2] library.
* No more mapcache, the plugin now uses [ehcache][3] by default.
* Only ehcache is supported directly but it's really easy to implement an adapter for other caching libraries if you need to.
* Slightly simplified configuration. Some minor tweaks will be needed if you're upgrading from an earlier version of the plugin.
* Bean names are now prefixed with _"springcache"_ so they're much less likely to clash with other things in your Spring context.

There has been some interest in some new features such as a taglib for caching chunks of views which I may start looking at shortly.

[1]: http://blog.freeside.co/post/42902700224/springcache-plugin-status
[2]: https://springmodules.dev.java.net/
[3]: http://ehcache.org/

