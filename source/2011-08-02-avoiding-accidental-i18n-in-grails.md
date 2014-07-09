---
title: 'Avoiding accidental i18n in Grails'
date: 2011-08-02T13:01:00+0100
tags: i18n, spring, css, progressive enhancement, resources
alias: post/42903249048/avoiding-accidental-i18n-in-grails/
---

We’re developing an app that’s exclusively for a UK audience so i18n really isn’t an issue for us. However recently we got bitten by some i18n creeping in where we didn’t want it. Specifically, when using Grails’ `g:dateFormat` tag the default behaviour is to format the date according to the `Locale` specified in the user’s `Accept-Language` header. Even though we are explicitly specifying a format pattern for the date Java is aware of localized day names for some languages so the output can vary. The result is that on a page full of English text there suddenly appears a Spanish or Swedish day name. What makes things worse is that as we use server-side content caching and a CDN if a user with a non-English `Accept-Language` header is the first to see a particular page or bit of dynamically retrieved content then the cache is primed and until it expires _everyone_ will see the non-English day name text.
The solution in a Grails app is as simple as replacing Spring’s standard `localeResolver` bean with an instance of `FixedLocaleResolver`. Just add the following to _grails-app/conf/spring/resources.groovy_:

    localeResolver(org.springframework.web.servlet.i18n.FixedLocaleResolver, Locale.UK)

This changes the way Spring works out the request locale and any locale-aware tags should just fall into place.

