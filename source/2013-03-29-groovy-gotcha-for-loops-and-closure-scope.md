---
title: 'Groovy gotcha: for loops and closure scope'
date: 2013-03-29T12:30:00+0000
tags: groovy
alias: post/46587122020/groovy-gotcha-for-loops-and-closure-scope
---

You probably know that Groovy closures retain information about the scope in which they were created. The closure body can refer to values that were in scope where the closure was declared. There is a gotcha here that has bitten me a few times, though. That's when closures are created in a `for` loop.

<!-- more -->

Consider this example.

	#!groovy
	def fns = []
	for (i in (1..5)) {
		fns << {->
			println i
		}
	}
	fns.each { it() }

What will get printed to _sysout_? Give up? You can [run the script on Groovy Web Console][ex1].

When the closures are run the value that is bound to the variable `i` is the value it had on the *final* iteration of the loop rather than the iteration where the closure was created. The closures' scopes have references to `i` and by the time any of the closures are executed `i` is *5*.

Variables local to the loop body do not behave like this, obviously because each closure scope contains a reference to a different variable. Here's another example where I'm using a local variable in the loop to store the square of the loop variable itself. What will be printed to _sysout_ this time?

	#!groovy
	def fns = []
	for (i in (1..5)) {
		def isq = i * i
		fns << {->
			println "$i squared is $isq"
		}
	}
	fns.each { it() }

You can [run this on the Groovy Web Console][ex2] if you like.

I've run afoul of this a couple of times when augmenting Grails artifacts with new behavior in a plugin. Given what we know of loop variables & closure scope consider what this code would do:

	#!groovy
	for (domainClass in grailsApplication.domainClasses) {
		domainClass.metaClass.getPropertyNames = {->
			domainClass.persistentProperties*.name
		}
	}
	
This kind of bug can be, to say the least, tricky to track down.

What's the solution? Should we always use `.each` rather than a *for* loop? Well, I kind of like *for* loops in many cases and there can be memory utilization differences (don't take that to mean loops are "better" or "more efficient").

If you simply alias the loop variable and refer to that alias in the closure body all will be well:

	#!groovy
	def fns = []
	for (i in (1..5)) {
		def myi = i
		def isq = i * i
		fns << {->
			println "$myi squared is $isq"
		}
	}
	fns.each { it() }

Here the output is exactly what we'd hope (if you don't believe me [run it on the Groovy Web Console][ex3]).

[ex1]:http://groovyconsole.appspot.com/script/920002
[ex2]:http://groovyconsole.appspot.com/script/928001
[ex3]:http://groovyconsole.appspot.com/script/929001
