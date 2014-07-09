---
title: 'Wiring taglib dependencies in Grails 2 unit tests'
date: 2011-12-23T10:24:00+0000
tags: grails, testing
alias: post/41774569512/wiring-taglib-dependencies-in-unit-tests/
---

Grails 2 has made a lot of improvements in unit testing support. One of the things I always used to find particularly painful was unit testing taglibs. Now when your test class is annotated with `@TestFor(MyTagLib)` you can use the `applyTemplate` method like this:

	#!groovy
	expect:
	applyTemplate('<my:tag/>') == 'the expected output'

However, one thing I found is that it's quite tricky to wire a dependency in to the taglib instance that's used by the `applyTemplate` method.

<!-- more -->

Let's imagine that `my:tag` makes a call to a Grails service for some reason. In the tag's unit test you'll need to wire in a mock or real instance of that service.

Although like with the old `TagLibUnitTest` and `TagLibSpec` classes your test gets a field called `taglib` that doesn't actually appear to be the instance that `applyTemplate` uses. This fails:

	#!groovy
	void setup() {
		tagLib.myService = new MyService()
	}

	void 'a taglib spec'() {
		expect:
		applyTemplate('<my:tag/>') == 'the expected output'
		// blows up with NullPointerException when the tag tries to call the service
	}

Grails 2 unit test mixins provide a `defineBeans` method that allows you to add Spring beans to a mock application context using the _BeanBuilder_ DSL. So, next I tried this:

	#!groovy
	void setup() {
		defineBeans {
			myService(MyService)
		}
	}

	void 'a taglib spec'() {
		expect:
		applyTemplate('<my:tag/>') == 'the expected output'
		// blows up with NullPointerException when the tag tries to call the service
	}

After some digging I discovered that you need to use `defineBeans` in `setupSpec` rather than `setup` for the wiring to work (I guess this would mean in `@BeforeClass` in a JUnit test). So this _does_ work:

	#!groovy
	void setupSpec() {
		defineBeans {
			myService(MyService)
		}
	}

	void 'a taglib spec'() {
		expect:
		applyTemplate('<my:tag/>') == 'the expected output'
	}

All very well so long as you don't need to inject a specific instance of _MyService_ into the tag. Unfortunately, often you will need to do exactly that so that you can wire in a stub or mock that your test can control. Also, Spock's mocks can't be created in `setupSpec` only in `setup` or the specification methods.

The test does get an `applicationContext` variable, but that doesn't have a method on its API to allow you to register an existing object as a bean. Spring's `MockApplicationContext` does, and after some digging I found that there's an instance of that available as `grailsApplication.mainContext`. However a bean added there doesn't get picked up by the tag either:

	#!groovy
	def mockService = Mock(MyService)

	void setup() {
		grailsApplication.mainContext.registerBean('myService', mockService)
	}

	void 'a taglib spec'() {
		expect:
		applyTemplate('<my:tag/>') == 'the expected output'
		// still blows up with NullPointerException when the tag tries to call the service
	}

Eventually I figured out that instead of registering your mock dependency in the application context you can instead get the correct taglib instance _from_ the application context and then wire its dependencies directly. I use Spock's mocks almost exclusively for this kind of thing, but the same technique should hold for any other mocking framework. What I ended up doing is this:

	#!groovy
	def mockService = Mock(MyService)

	void setup() {
		def taglib = applicationContext.getBean(MyTagLib)
		taglib.myService = mockService
	}

	void 'a taglib spec'() {
		expect:
		applyTemplate('<my:tag/>') == 'the expected output'
	}

Hopefully this is something that will get ironed out in a future Grails release but in the meantime hopefully this will be helpful for anyone who gets as stumped as I did.

