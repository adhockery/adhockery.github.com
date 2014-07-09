---
title: 'Full page caching in Grails with Ehcache-Web'
date: 2010-02-23T12:47:00+0000
tags: caching
alias: post/42902815893/full-page-caching-in-grails-with-ehcache-web/
---

I'm on the verge of releasing a new version of the [Springcache plugin][1] that will feature a pretty cool new annotation-driven page fragment caching feature based on [Ehcache-web][2]. However one of the things that came up during discussions on the mailing list was full page caching. I mentioned that it was pretty straightforward and promised to blog about how to do it, so…

<!-- more -->

## Install Ehcache-web

Add the following to your dependencies in BuildConfig.groovy:

    runtime("net.sf.ehcache:ehcache-web:2.0.0") {
     excludes "ehcache-core"
    }

## Install Grails templates

Run: `grails install-templates`

## Set up a page caching filter

Edit `src/templates/war/web.xml` and add this to the `filters` section:

    <filter>
     <filter-name>MyPageCachingFilter</filter-name>
     <filter-class>net.sf.ehcache.constructs.web.filter.SimplePageCachingFilter</filter-class>
     <init-param>

cacheName

myPageCache

     </init-param>
    </filter>

And this as the _first entry_ in the `filter-mappings` section:

    <filter-mapping>
     <filter-name>MyPageCachingFilter</filter-name>
     <url-pattern>/controller/action/*</url-pattern>
     <dispatcher>REQUEST</dispatcher>
    </filter-mapping>

## Configure the cache

Unfortunately you can't configure the cache in `grails-app/conf/spring/resources.groovy` using `EhCacheFactoryBean` instances as the servlet filter initialises before the Spring context. The cache definitions need to be added to a `ehcache.xml` which would normally be placed in `grails-app/conf`. Here is an example that works for the filter definitions above:

    <ehcache>

        <diskStore path="java.io.tmpdir"/>

        <defaultCache
                maxElementsInMemory="10"
                eternal="false"
                timeToIdleSeconds="5"
                timeToLiveSeconds="10"
                overflowToDisk="true"
                />

        <cache name="myPageCache"
               maxElementsInMemory="10"
               eternal="false"
               timeToIdleSeconds="10000"
               timeToLiveSeconds="10000"
               overflowToDisk="true">
        </cache>

    </ehcache>

You will need to add another `filter` and `filter-mapping` and potentially another cache for each URL pattern you want to cache separately.

Full page caching is fine for simple pages but isn't as flexible as fragment caching. For example, any authenticated state (such as a _"Welcome back xxx"_ label) on the page would get cached across all users. Because Grails uses [Sitemesh][3] and has the `[<g:include>][4]` tag for including output from other controllers a fragment caching solution is a good fit. The 1.2 release of the Springcache plugin will add fragment caching functionality. However, I can imagine using full-page caching like this for things like RSS feeds.

[1]: http://grails.org/plugin/springcache
[2]: http://ehcache.org/documentation/web_caching.html
[3]: http://www.opensymphony.com/sitemesh/
[4]: http://grails.org/doc/latest/ref/Tags/include.html

