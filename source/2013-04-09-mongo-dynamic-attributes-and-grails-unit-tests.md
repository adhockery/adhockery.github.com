---
title: 'Mongo dynamic attributes and Grails unit tests'
date: 2013-04-09T20:35:28+0100
tags: mongo, gorm, testing
alias: post/47556649498/mongo-dynamic-attributes-and-grails-unit-tests
---

When using *Mongo DB* with *GORM* it's possible to assign to dynamic attributes of a domain class. However, you'll find that when you write unit tests for code that uses this feature it isn't supported. It's easy to emulate, though.

<!-- more -->

All domain classes that are enabled in a test using the `@TestFor` or `@Mock` annotations are available via `grailsApplication.domainClasses`. This means you can simply add something like this in your setup method:

	#!groovy
	for (domainClass in grailsApplication.domainClasses) {
	    domainClass.metaClass.with {
	        dynamicAttributes = [:]
	        propertyMissing = { String name ->
	            delegate.dynamicAttributes[name]
	        }
	        propertyMissing = { String name, value ->
	            delegate.dynamicAttributes[name] = value
	        }
	    }
	}

This is a pretty simplistic emulation of the real behavior – any changes you make to dynamic attributes will take effect on the "persisted" domain instance even if the save fails. Generally I don't think it's likely there would be much ambiguity around that in a test but it's worth bearing in mind.
