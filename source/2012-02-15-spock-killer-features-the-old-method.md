---
title: 'Spock Killer Features: The ''old'' method'
date: 2012-02-15T06:46:00+0000
tags: groovy, spock, testing
alias: post/41774646403/spock-killer-features-the-old-method
---

I use Spock almost exclusively to test Groovy or Java code these days. It's got some fantastic features that other test frameworks don't have. Some of them aren't that well known or documented, though.

The `old` method is possibly my favourite Spock feature. It's a simple thing but really enhances test legibility. It's also great for wowing developers new to Spock because it looks like black magic at first glance.

<!-- more -->

Consider a simple test like this:

	#!groovy
	when:
	myList << 'foo'

	then:
	myList.size() == 1

This is fine in simple cases, but what happens if `myList.size()` is in a less predictable state? I've used this technique for testing cache usage for instance; making assertions about hit & miss counts and cache size. Those numbers are less predictable as they'll be affected by other things (concurrency or side-effects of test setup, for example). Hardcoding expected values makes the tests brittle.

We can improve things a little by comparing the value after the `when:` block with the value before it:

	#!groovy
	given:
	def oldSize = myList.size()

	when:
	myList << 'foo'

	then:
	myList.size() == oldSize + 1

With Spock's `old` method there's an even neater way, though:

	#!groovy
	when:
	myList << 'foo'

	then:
	myList.size() == old(myList.size()) + 1

Wait, WTF is going on there? That's voodoo!

In fact Spock is using an AST transformation to execute the call to `old` _before_ the `when:` block. If you step through the spec with the debugger in IntelliJ Idea you'll see exactly what's going on. The execution jumps to the line with `old` before the `when:` block lines, then visits it again afterwards.

The `old` method returns the value an arbitrary statement had _before_ the preceding `when:` block was executed. Because of this `old` can only be used in a `then:` block (or any subsequent `and:` blocks).

There's no limit to what you can do with `old`. I've used it in _Geb_ specs to do things like this:

	#!groovy
	given:
	to CocktailListPage

	when:
	to NewCocktailPage
	cocktail.name = 'Dirty Martini'
	cocktail.save.click()

	then:
	at CocktailListPage

	and:
	cocktailList.names == old(cocktailList.names) + ['Dirty Martini']

