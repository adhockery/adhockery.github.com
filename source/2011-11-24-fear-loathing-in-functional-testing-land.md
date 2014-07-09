---
title: 'Fear & loathing in functional testing land'
date: 2011-11-24T00:59:00+0000
tags: geb, selenium, testing, functional testing, spock
alias: ["post/42903299940/fear-loathing-in-functional-testing-land/"]
---

As projects grow the two things I've repeatedly found to be particularly painful have been functional testing and data fixtures. I might write up some thoughts on data fixtures another time but what follows is a brain-dump of my troubled relationship with functional testing.

_Disclaimers:_ I have more questions than answers and I'm completely open to the idea that _I'm doing it all wrong_. I'm not trying to diss any tool or technique here. I have spent a lot of time over the last few years writing functional test coverage so I think I at least have some perspective on the issues if no clue how to solve them.

<!-- more -->

When I say functional testing I mean in the [GOOS][1] approach of working outside in; starting with a (failing) functional test that defines the desired behaviour in a user-centric way and building in to the low-level implementation with its unit tests then back out to watch the original end-to-end test (hopefully) pass.

## Why is functional testing difficult?

### Test development cadence

The main issue I find when constructing functional tests is what I'll call the _test development cadence_; that is the time it takes to go round the loop (and sub-loops) of

1. write a bit of test
2. watch it fail
3. write some code to make it work
4. watch it still fail
5. figure out if your expectation is wrong or your code doesn't work
6. fix it
7. repeat last 3 steps _n_ times
8. watch it pass
9. [celebrate][4]

With a unit test that time is typically fast, a keystroke in an IDE and the results are available in at most a couple of seconds. Functional tests are considerably slower. Even assuming you can optimise so that the application is running and you can run the test from an IDE then Selenium has to start up a browser instance, queries execute, views need to render, etc. In the worst case you're switching to the terminal and using `grails test-app functional: Blarg` or equivalent then waiting for the webapp to start up before the test can even start to run and shut down again before the report is generated.

A slow test development cadence leads to distraction (checking _Twitter_, making coffee, getting drawn into a discussion of the finer points of mixing an _old fashioned_, etc.) and distraction leads to context-switching which slows things still further.

### Test diagnostics

_GOOS_ makes a great point about the importance of test diagnostics suggesting that the [_TDD_][2] mantra of [power assert][3] output its not always clear whether the functionality didn't work or the expectation is incorrect. Selenese is by no means great in this regard (a humble `Condition timed out` isn't much help) but at least you can step back with the Selenium IDE and watch the damn thing not working much more easily.

Bad test diagnostics coupled with a slow test development cadence make for a horrible experience.

## The quest for the functional testing holy grail

The _most productive_ I've ever been when writing functional tests has been when using [Selenium IDE][5]. That's quite an admission for someone who's spent a considerable amount of time &amp; energy over the last few years trying to find or build something better!

The test development cadence is fast. Really fast. When you're writing tests with Selenium IDE (and I do mean **write** them, I've almost never used the recording functionality) the app is running, the browser is running and you can execute the test, a portion of the test or an individual command very quickly. You can step through the test, set breakpoints, etc. When using a framework like Grails that lets you make changes to the app without restarting you can rock along pretty rapidly.

That said, the downsides are not inconsiderable:

* Abstraction is typically poor; you're dealing with fine details of page structure (DOM element ids, CSS selectors) and copy 'n pasting sequences of commands that would in a sane world be defined as functions or macros. You _can_ write custom JavaScript commands but with considerable limitations such as the fact that any _wait for x_ step must be the last thing the command does. Lack of abstraction means lack of maintainability. As the project goes on any change in page rendering probably means picking apart a bunch of tests that fail not because the functionality they are testing has stopped working but because the implementation of that functionality has changed.
* Atomicity is difficult. Because each test probably requires a few lines of setup it's tempting for developers to add new assertions to an existing test. This violates the principle of having a single (logical) assertion per test. Part of the problem I think is that with Java, Groovy, Ruby, etc. each _file_ can contain multiple tests whereas with Selenese each file is a single test script. The right thing to do is to have lots of small Selenese test files but it's tempting to fall into the trap of munging tests together into the testing equivalent of a [run-on sentence][6]. One of the worst side-effects of this is that as a test suite grows it becomes really hard to identify _where_ certain features are tested and to find redundancy or obsolete tests.

Despite these significant failings _writing_ tests in Selenium IDE is very effective. Maintaining a suite of such tests is another matter. Working on a long-running project the failings of Selenese tests start to increase logarithmically. The reason I created the [Grails Selenium RC plugin][7] was to try to build something I could use in future projects that would combat the failings of Selenese. I wanted to use a 'real' language with selection and iteration and to be able to build a robust abstraction so that tests are not dealing with the fine details of page markup. [Geb][8] is another step along this road. It provides a nice way of defining page objects and modules and handles things like tracking which page class is the 'current' one and how and when that should change.

## What do I want from a functional testing tool/language?

I'm convinced that the goal of writing tests in the same language as the application is a pretty vapid one. Working inside one's comfort zone is all very well but too many times I've seen things tested using Selenium or Geb that would be better tested with a unit-level JavaScript test. I'm guilty of this myself. I'm a better Groovy coder than I am a JavaScript coder so it's easy initially to break out a new Geb spec than a new Jasmine spec. Functional testing tools are _really bad_ at testing fine-grained JavaScript behaviour, though. These sort of tests are really flaky, false negatives are a fact of life. They're wastefully slow as well. JavaScript unit tests are _fast_, faster than Groovy unit tests. As a Grails developer I've looked enviously at how fast tests run in Rails apps but that's nothing compared to watching a couple of hundred [Jasmine][9] tests run in under a second. To get back to the point, I have no problem with writing my functional tests in something other than Groovy if I can hit my goals of productivity and maintainability.

I was at one time convinced that the ability to use loops and conditional statements in Groovy made it a more suitable testing language than Selenese but honestly, how often are such constructs really required for tests? The The single most essential thing for a maintainable suite of functional tests is the ability to create a decent abstraction. Without that you'll be building brittle tests that fail when the implementation changes 100 times more often than they fail because the functionality they're testing is actually broken.

## Abstraction is key

The abstraction layer needs to be powerful but simple. I've seen test suites crippled by badly written page object models and I'm starting to feel that the whole idea is too formalized. Building Geb content definitions with deeply nested layers of `Module` types is time consuming &amp; difficult. With Selenium RC there's not even the page transition logic Geb provides so you end up having to write that as well (probably getting it wrong or implementing it in several different ways in different places).

I can't help thinking the page object model approach is coming at the problem from the wrong angle. Instead of abstracting the UI shouldn't we be abstracting the behaviour? After all the goal is to have tests that describe how users interact with the application rather than how the various components that make up the application relate to one another. I'd rather have a rusty toolbox of lightweight macros and UI module definitions than a glittering palace of a page component model that I find awkward to use, extend or change. The abstraction has to be there - when I change the implementation I don't want to spend half a day finding and fixing 100 subtly different CSS selectors scattered throughout the tests - but I don't think it has to be particularly deep.

## Where do I go from here?

### A better Selenese?

An interesting possibility for creating better Selenese tests is the [UI-Element extension library][10] that allows a UI abstraction layer to be built on top of Selenese. It also introduces the concept of _rollup rules_ (paramaterized macros) that are a more powerful way of abstracting command sequences than custom Selenese commands. From what I've seen the tool support in Selenium IDE looks impressive too. I need an opportunity to use _UI-Element_ seriously but it certainly appears promising.

The most impressive Selenium extension I've seen is Steve Cresswell's [Natural Language Extensions][11] that layers something like [JBehave][12]'s feature definition language on top of Selenese. [Energized Work][13] used this on a couple of projects (unfortunately not ones I was involved with) and I've heard great stories of how it enabled really rich cooperation between developers, QA and project stakeholders. I was pleasantly surprised with how simple the underlying code appeared to be given the radical difference in the test language.

### Other options?

The tools I really need to look into are:

* [Cucumber][14] which syntactically looks like the answer to my prayers. I want to see how fast the test development cadence is. Since there's now [a pure JVM implementation][15] I really have no excuse for not getting up to speed with it pronto.
* [FuncUnit][16] is much lower level and I'm not sure how easy it would be to build an effective abstraction layer that kept the tests readable and maintainable but it's fast and runs right in the browser which are potentially compelling advantages.

[1]: http://grails.org/doc/latest/guide/9.%20Testing.html#9.3%20Functional%20Testing "Growing Object-Oriented Software, Guided By Tests"
[2]: http://en.wikipedia.org/wiki/Test-driven_development "Test-driven development"
[3]: http://jamesshore.com/Blog/Red-Green-Refactor.html "Groovy Power Asserts"
[4]: http://s3.amazonaws.com/kym-assets/entries/icons/original/000/006/548/211092_242669842430795_4056741_n.jpg?1313963401
[5]: http://seleniumhq.org/projects/ide/
[6]: http://en.wikipedia.org/wiki/Run-on_sentence
[7]: http://robfletcher.github.com/grails-selenium-rc/docs/manual/index.html
[8]: http://www.gebish.org/
[9]: http://pivotal.github.com/jasmine/
[10]: http://ttwhy.org/code/ui-doc.html
[11]: https://github.com/energizedwork/selenium-ide-nle
[12]: http://jbehave.org/
[13]: http://energizedwork.com/
[14]: http://cukes.info/
[15]: https://github.com/cucumber/cucumber-jvm/
[16]: http://funcunit.com/

