---
title: 'Upgrading to Grails 2: Part 1'
date: 2011-11-29T00:07:00+0000
tags: grails
alias: post/41774508756/grails-2-upgrade-part-1
---

We've recently spent some time ensuring that our application is forwards-compatible with the upcoming Grails 2. Our app is broadly split into the application itself and a large plugin that forms the core of our [CMS][cms]. We upgraded the plugin first as it contains the core domain classes but is also a slightly smaller task to tackle. I'll write up our findings when we've completed upgrading the application itself in a follow-up to this post.

Although it took a little while I found the upgrade less painful than some previous versions. It feels like Grails is really maturing so there are fewer fundamental breaking changes and more in the way of new features. The bulk of the changes we had to make were to unit tests which are vastly improved in Grails 2. That said, I can see some of the things we ran into stumping people so I thought a write-up would make a useful reference. Some of these items may already be covered by the [upgrading section of the Grails user guide][user-guide-upgrading] but some, particularly around plugins are probably new.

<!-- more -->

## Compilation

Firstly we needed to do to just get the build working to the point where tests would run.

### Upgrade Spock

Version _0.6-SNAPSHOT_ of the [Spock plugin][spock-plugin] is required for compatibility with Groovy 1.8.

This also required us to update `@Unroll` annotations to use _Closure_ parameters. Instead of

	#!groovy
	@Unroll("#a plus #b should equal #x")

the annotation needs to be

	#!groovy
	@Unroll({"$a plus $b should equal $x"})

Whilst this is a bit of a chore there are some advantages to this format as you can reference properties and call methods on the parameters right in the annotation.

Before the tests would run we got a compilation error:

	The return type of java.lang.Object mockDomain(java.lang.Class) in com.sky.cms.AssetSpec is incompatible with void mockDomain(java.lang.Class) in grails.plugin.spock.UnitSpec`

There's some kind of clash between the method signatures of _mockDomain_ in Spock's _UnitSpec_ and Grails core. We'd intended to switch to the new annotation-based unit test support anyway but apparently we needed to do so right away. On the surface this just meant making our specs extend _Specification_ instead of _UnitSpec_ and introducing the new `@TestFor` annotation. The other changes we had to make to get our tests running successfully are covered below.

## Configuration changes

Configuration-wise all we had to do was to change _DataSource.groovy_ to reference _H2_ rather than _hsqldb_. Because we were just dealing with the CMS plugin and its test harness we hadn't modified the default file in any way so we just replaced it with the new one from Grails 2 with:

	#!bash
	cp $GRAILS_HOME/src/grails/grails-app/conf/DataSource.groovy grails-app/conf/

## Unit tests

The bulk of the time we spent upgrading was spent on unit tests. This is understandable since Grails 2 has made some significant enhancements in unit test support. Most of the changes are pretty straightforward but there are a couple of gotchas here.

* The `mockConfig` method was always a bit awkward (as anyone who has tried to assign the path to a _File_ object to a config key on a Windows machine will attest) and has been removed. Unit tests now get a genuine _GrailsApplication_ instance injected by default if using one of the new annotations and you can directly assign values to the `config` property.
* Remove `mockDomain` calls & add a `@TestFor` or `@Mock` annotation to the test class. Use `@TestFor(MyDomainClass)` for the domain class' own tests and `@Mock(MyDomainClass)` when the domain class is a collaborator. `@Mock` accepts multiple classes if you need it.
* We had a number of assertions about domain validation errors that we had to change from `domainInstance.errors.<fieldName>` to `domainInstance.errors.getFieldError('<fieldName>').code`. The latter is more long winded but has the advantage of using the same API as when you deal with Spring _Errors_ instances in application code.
* Tests for a controller that has an `allowedMethods` declaration must set the `request.method` or they get a _405: Method Not Allowed_ response.
* Domain class validation is evaluated on mock domain instances. Often this isn't actually desirable. Tests cluttered with data setup that is only required to satisfy domain constraints are harder to maintain. To get round this you can use `.save(validate: false)`.
* Domain class event handlers such as _beforeInsert_ are not triggered unless the session is flushed. In the few tests this affected we just had to change `.save()` to `.save(flush: true)`.
* Assigned ids are wiped from domain object instances when `@Mock` is used. It seems like even when assigning ids on construction with code like `new Pirate(id: 1234, name: "Edward Teach")` the _id_ will be _null_ until the _save_ method is called. This wasn't a big deal for us & mostly meant getting rid of a few [magic numbers][magic-numbers] from test code.
* `grailsApplication` is not wired into domain instances like it is into controllers and tag libs when using `@TestFor`.
* We ran into some issues with tests for property editors where we were setting up mock a _request_ variable. We had a _NullPointerException_ thrown from domain class constructors after doing so. Using the _request_ property provided by `@TestMixin(ControllerUnitTestMixin)` instead fixed things.
* We converted our old tag lib tests to use `@TestFor(TagLibClass)` and the new _applyTemplate_ method. See the [relevant section of the Grails user guide][user-guide-taglib-testing] for more details on this.
* Tag libs using `@TestFor` can actually find and render GSP templates when they call _render_. This means you might get more realistic output than your test was previously expecting!
* We found that when testing tag libs with `@TestFor` that modifying the metaclass of the `taglib` field of the test class didn't affect tests using _applyTemplate_. However, we just had to change from `taglib.metaClass.blah` to `MyTagLib.metaClass.blah`.

## Plugins

### Joda Time

We upgraded the [Joda-Time plugin][joda-time-plugin] to version _1.3_. This also meant we had to add the Hibernate persistence library to the _dependencies_ section of _BuildConfig_ [as documented here][joda-time-hibernate].

### Resources

The Resources plugin currently (up to at least version _1.1.1_) [has a bug][gpresources-109] that means it does not generate resources properly in anything other than _dev_ mode. There is a workaround; just add the following to _BootStrap_:

	#!groovy
	def grailsResourceProcessor

	def init = {
	    grailsResourceProcessor.updateDependencyOrder()
	}

### Geb

We upgraded [Geb][geb] to version _0.6.1_ and the [Selenium][selenium] drivers to version _2.13.0_. The only issues we ran into were:

* An additional dependency is required to handle `select` elements properly (installation details are handily included in the report for any test that fails due to this).
* Setting values on `input type="file"` elements no longer worked. I've already fixed this issue and it should be in the next _Geb_ release. See [GEB-152][geb-152] for more information.

## Other Libraries

We had one test that used _[GMock][gmock]_. Unfortunately it is not currently compatible with Groovy 1.8. For us this wasn't a big deal as we could easily drop _GMock_ but some codebases may be more invested in it.

## Actual Grails bugs

We only found a couple of problems with Grails itself both of which I've raised on the Grails bug tracker:

* [GRAILS-8376][grails-8376] Constraints on superclass associations are not inherited properly in mock domain instances. This bit us when instances of a child class of a superclass that had an association with `nullable: true` failed to save. The workaround is to simply duplicate the constraint in the child class (yes, it's ugly).
* [GRAILS-8377][grails-8377] `grails test run-app` fails with `Error loading plugin manager: GebGrailsPlugin`. This is kind of an edge case. We were only trying to run the application in test mode to help figure out the problem with resource processing mentioned above.

[cms]:http://en.wikipedia.org/wiki/Content_management_system "Content management system"
[geb]:http://gebish.org/
[geb-152]:http://jira.codehaus.org/browse/GEB-152
[gmock]:http://code.google.com/p/gmock/
[gpresources-109]:http://jira.grails.org/browse/GPRESOURCES-109
[grails-8376]:http://jira.grails.org/browse/GRAILS-8376
[grails-8377]:http://jira.grails.org/browse/GRAILS-837y
[joda-time-hibernate]:http://gpc.github.com/grails-joda-time/guide/2.%20Persistence.html
[joda-time-plugin]:http://gpc.github.com/grails-joda-time/
[magic-numbers]:http://en.wikipedia.org/wiki/Magic_number_(programming)#Unnamed_numerical_constants
[selenium]:http://code.google.com/p/selenium/
[spock-plugin]:http://grails.org/plugin/spock
[user-guide-taglib-testing]:http://grails.org/doc/2.0.x/guide/testing.html#unitTestingTagLibraries
[user-guide-upgrading]:http://grails.org/doc/2.0.x/guide/gettingStarted.html#upgradingFromPreviousVersionsOfGrails

