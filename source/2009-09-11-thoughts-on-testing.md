---
title: 'Thoughts on Testing'
date: 2009-09-11T02:56:00+0100
tags: testing
alias: post/42902576958/thoughts-on-testing/
---

These are some of the practices I try to live by when writing test coverage. Some of the detail may be [Grails][1]-centric since that's been my development platform of choice for the last couple of years, but the gist of the points is generally applicable.

I've been thinking about posting something like this for quite a while and was pushed over the edge by reading some interesting things...

* [Simon Baker][2] recommended that I read what J.B. Rainsberger [has to say about integration tests][3] which chimed with my disgruntlement with them and my tendency to refactor old integration tests into unit tests when I touch related code.
* [Tim Ottinger][4] posted about [stopping the 'bad test death spiral'][5].
* [Jerome Pimmel][6] pointed me at [this article][7] that adds to my growing suspicion that we're going about [Selenium][8] testing all wrong!

<!-- more -->

## Make just one (logical) assertion per test.

The prime attribute of a good test case is legibility. When my change breaks your test I don't what to be scratching my head trying to figure out what it is your the test is trying to prove. The best way to achieve legibility is to have each test case test <i>just one thing</i>. Sure, it may take more than one actual assert statement to test it properly. For example to test a query returns correct values you may want to assert that the return value is non-null, that it is a collection with the correct size and that each element of the collection complies with the query parameters. Those are separate assertion statements but in the service of a single _logical_ assertion.

One of the worst habits you can get into when adding new functionality is to just bung a few more asserts into an existing test case. Imagine we're testing a list action on a Grails controller class. There's an existing test case to confirm the list of instances in the model are correct. You implement a new requirement to load some sidebar content for the page by adding some new stuff to the model (leaving aside the fact that there are better ways to achieve this). This change should be tested with a separate (set of) test case(s) to those testing the list model is correct. That may mean some duplication with several test cases invoking the same controller action with the same parameters but the trade-off is that each test case is self-contained, legible and will not break due to further changes that aren't related to the functionality the test is supposed to be verifying.

## Name test cases according to what they are testing

This sounds obvious, but how often do you come across test cases named something like `testSaveArticle` that doesn't make it obvious _what_ it is testing about saving an article? A good test case name is verbose but only as verbose as it needs to be; names like `testListReturnsEmptyListWhenNoResultsFound`, `testListOnlyReturnsLiveAssets`, `testUserIsRedirectedToLoginFormIfNotLoggedIn` tell me what I have broken when my changes cause those tests to fail. On the other hand if a test case name is too long or contains a lot of _'and's_ & _'or's_ it's probably a sign that the test is doing too much and not making a single logical assertion.

## Avoid obliquely named 'helper' methods

Few things bug me more when trying to decipher other peoples' tests than helper methods whose names either don't describe properly what it is they do or that have a raft of side effects. These things make tests harder to read, not easier! Names like `initMocks` (to do what?), `createArticles` (how many? anything special about them? what behaviour are they trying to drive out?) or `checkModel` (what about it? how reusable is this?) require the person maintaining your test cases to find the implementation and figure out what it's doing.

Worse, such methods have a tendency to accumulate complex parameters over time, (often with defaults designed to minimise impact on existing code at the expense of making any sense) as they get re-used in new test cases that require them to do slightly different things.

## Avoid the _test-per-method_ anti-pattern

The 'test-per-method' anti-pattern is characterised by test cases named `test_MethodNameX_` that attempt to test all the paths through a given API method in a single test case (or worse, test only the happy path). A lot of people start out writing unit tests this way, probably because a lot of unit testing tutorials are written this way.

The problem is this pattern bundles a bunch of assertions into a single test and if the earlier ones fail the later ones won't even run meaning you can waste time uncovering layers of broken functionality as you work your way through the failures and re-run the test.

Legibility suffers as well as it may not be obvious at a glance what edge cases, boundary conditions and side-effects are covered and what the expectations for them are. If any kind of state has to be reset between different calls to a method then you will end up writing code that you simply wouldn't if you separated things out into multiple test cases.

## Test edge cases and variant behaviour

Tests that only cover the _happy path_ give you false confidence. Coverage should include things like...

* What happens when `null` is passed to this method?
* What is returned when a query finds no results?
* What happens when you can't connect to that web service or the connection times out?
* What happens when a user submits a form with incorrect data?
* What happens when someone figures out your URL scheme includes domain instance ids and starts crafting their own URLs to retrieve records that don't exist?
* What happens when someone figures out your URL includes a `maxResults` parameter and crafts a URL to request 10<sup>100</sup> results?

TDD is your friend here; if you don't write the code until you've got a test for it, it's a lot harder to miss coverage of edge cases. Similarly the first thing you do when a bug is uncovered is to write a test that fails _then_ fix it.

## Test the thing you care about not a signifier

Max [introduced me to the anti-pattern of false moniker testing][9] and it's really changed the way I write assertions. It's an easy trap to fall into. Imagine you're testing that a query only returns 'live' records. Do you set up some _live_ and some _non-live_ records with particular names and then test that the names you expect show up in the results, or do you set up the data then assert that all the results actually are 'live' records? The former is terribly error prone (you assume you've set the data up correctly) and much less legible (which records are we expecting? Why that one in particular?)

Groovy's [`every`][10] iterator method is a godsend here enabling you to write code like:

    def results = MyDomain.findAllLiveRecords()
    assertFalse results.isEmpty()
    assertTrue results.every { it.state == 'live' }

## Avoid the monolithic setUp method

Much as it's bad to overload individual test cases with too many assertions it quickly becomes a problem when your `setUp` method is trying to set up data for too many test cases. Different test cases will probably require slightly different data to drive them which results in `setUp` trying to be all things to all cases or doing things that only a subset of the test cases actually need. As new functionality is developed the `setUp` becomes a black hole, accumulating more and more mass and becoming less legible and harder to refactor. The cohesion of the individual tests is harmed as well as it's hard to tell at a glance what data exists when an individual test case is run.

Ideally `setUp` should only be used for bootstrapping things that are truly common between _all_ test cases and the test cases themselves should be responsible for setting up data to drive the test case's assertions.

Really bad examples of this problem will have `setUp` create a bunch of data and then some of the test cases actually _delete it_ again before doing anything!
The worst example I've ever seen was from a project I worked on where the entire integration suite used a single DBUnit fixture! It was next to impossible to figure out what data would be returned in particular scenarios, impossible to change anything in the fixture without breaking a raft of other tests and the `setUp` and `tearDown` phases were so slow that the integration suite took 3 1/2 hours to run!

## Keep data fixtures simple

On a related note it's worth striving to keep test data fixtures as simple as possible. For example, if a test has to wire up a bunch of properties and sub-graphs on domain object instances to satisfy constraints it can be really hard to see the wood for the trees when trying to figure out what data the test actually cares about.

When testing Grails apps the [build-test-data plugin][11] is a fantastic tool here. It allows sensible defaults to be configured so that tests only need to specify the properties they need to drive their assertions. With well thought out defaults in `TestDataConfig.groovy` the resulting test code can be very simple.

In unit tests the situation is easier. Since domain objects don't need to pass constraints to simulate persistent instances via [mockDomain][12] you don't need to jump through hoops setting properties and wiring up sub-graphs, test cases can set up simple skeleton objects that just contain sufficient state to drive the functionality and assertions the test case is making.

## Test at the appropriate level

Slow-running integration tests that are not testing anything that couldn't be adequately tested with unit tests are just wasting time. In the Grails pre 1.1 this was a real issue as the enhancements that Grails makes to artefacts (domain classes, controllers, etc.) were not available in unit tests and therefore integration tests were the only practical way to Grails artefacts. Now with the unit testing support found in the `grails.test` package this is much less of an issue.

Integration tests definitely have their place but, I believe, should be used sparingly for things that a unit test _cannot_ test and not just written as a matter of course. In Grails apps, for example, [criteria queries][13] and [webflows][14] cannot be tested with unit tests. I would also argue that there is value in integration testing things like complex queries or transactional behaviour where the amount of mocking required to get a unit test to work would result in you simply testing your own assumptions or expectations.

Do...

* Write integration tests that add coverage that unit tests cannot.
* Learn about the Grails unit testing support and understand the differences between unit and integration tests.

Don't...

* Write an integration test when you should be writing a unit test or functional test.
* Write integration tests that re-cover what is already adequately covered by unit tests.

I find that integration tests classes named for a single class (_e.g._ if I have a `SecurityController` and an integration test called `SecurityControllerTests`) are a bad code smell worth looking out for. They often tend to be an integration test masquerading as a unit test.

Refactoring Grails integration tests into unit tests doesn't (usually) take long, speeds up your build and I find often results in up to 50% less test code with the same amount of coverage.

## Write functional test coverage

Okay, so your unit test verifies that your controller's _list_ action will accept a `sort` parameter and return query results appropriately but it can't test that the associated view renders a column-heading link that sends that param or that clicking on it again reverses the order. When you start developing rich functionality on a web front-end a back-end unit test isn't going to do you a lot of good either.

Grails' [functional testing plugin][15] is a pretty good tool although for rich interaction testing I'd rather use [Selenium][16].

Discussion of practices for these kind of tests really justifies a whole other post.

[1]: http://grails.org/
[2]: http://www.think-box.co.uk/
[3]: http://jbrains.ca/permalink/242
[4]: http://agileotter.blogspot.com/
[5]: http://agileinaflash.blogspot.com/2009/09/stopping-bad-test-death-spiral.html
[6]: http://twitter.com/franklywatson
[7]: http://adam.goucher.ca/?p=1198
[8]: http://seleniumhq.org/
[9]: http://stateyourbizness.blogspot.com/2008/07/good-unit-testing-practice.html
[10]: http://groovy.codehaus.org/groovy-jdk/java/lang/Object.html#every()
[11]: http://grails.org/plugin/build-test-data
[12]: http://grails.org/doc/latest/guide/9.%20Testing.html#9.1%20Unit%20Testing
[13]: http://grails.org/doc/latest/guide/single.html#5.4.2%20Criteria
[14]: http://grails.org/doc/latest/guide/single.html#6.5%20Web%20Flow
[15]: http://grails.org/plugin/functional-test
[16]: http://seleniumhq.org/

