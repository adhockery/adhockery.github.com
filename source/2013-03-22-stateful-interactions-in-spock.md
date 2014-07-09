---
title: 'Stateful interactions in Spock'
date: 2013-03-22T00:16:00+0000
tags: spock, testing
alias: post/45951535567/stateful-interactions-in-spock/
---

The Java mocking library [jMock][jmock] has [a nice feature for dealing with verifying mock interactions in stateful circumstances][jmock-states]. I first came across it when reading [Growing Object-Oriented Software Guided By Tests][goos] (_GOOS_) by Steve Freeman & Nat Pryce.

I was curious as to whether I could implement something similar with _Spock_. There's no syntactic support right now (although there is [an open issue][spock-issue]) but it's not that complex to achieve something adequate.

<!-- more -->

I got a basic version working using action closures. To directly translate the example from the _jMock_ documentation you'd do this:

	#!groovy
	given: "a turtle"
	def turtle = Mock(Turtle)
	
	and: "pen starts up"
	def pen = "up"
	
	// … when block with tested action
	
	then: "turtle draws a right angle"
	with(turtle) {
		1 * penDown() >> { pen = "down" }
		1 * forward(10) >> { assert pen == "down" }
		1 * turn(90) >> { assert pen == "down" }
		1 * forward(10) >> { asset pen == "down" }
		1 * penUp() >> { pen = "up" }
	}

The first and last interactions change the current state of the `pen` and the middle three assert that _pen_ is in a particular state _when the interaction occurs_. For example if `turtle.forward(10)` occurs when `pen` is not `"down"` then the assertion in the closure will cause the test to fail. As it's a Groovy assertion we'd also get a good diagnostic of the error.

The assertions on the state transitions are a bit redundant here. Perhaps a more useful approach is found in the way the examples in _GOOS_ work. There the state changes are modelled with stubs. Using that approach the previous example could be rewritten as:

	#!groovy
	given: "a turtle"
	def turtle = Mock(Turtle)
	
	and: "pen starts up"
	def pen = "up"
	
	and: "pen may be repositioned"
	with(turtle) {
		penDown() >> { pen = "down" }
		penUp() >> { pen = "up" }
	}
	
	// … when block with tested action
	
	then: "turtle draws a right angle"
	with(turtle) {
		1 * forward(10) >> { assert pen == "down" }
		1 * turn(90) >> { assert pen == "down" }
		1 * forward(10) >> { asset pen == "down" }
	}

It's clearer what's going on now. However, I'm not particularly keen on the explicit `assert` keywords. I'd also rather use an enum than a string to model the state. Wrapping the state transitions and verifications up into a small [`StateMachine`](https://gist.github.com/robfletcher/5217772) class makes sense. After doing that we end up with this:

	#!groovy
	given: "a turtle"
	def turtle = Mock(Turtle)
	
	and: "pen starts up"
	def pen = new StateMachine("pen", UP)
	
	and: "pen may be repositioned"
	with(turtle) {
		penDown() >> { pen.becomes(DOWN) }
		penUp() >> { pen.becomes(UP) }
	}
	
	// … when block with tested action
	
	then: "turtle draws a right angle"
	with(turtle) {
		1 * forward(10) >> { pen.is(DOWN) }
		1 * turn(90) >> { pen.is(DOWN) }
		1 * forward(10) >> { pen.is(DOWN) }
	}

I'm reasonably happy with the result. It's not often that this style of interaction testing is useful but it does crop up from time to time.

You can also consider using [strict invocation order][strict-order] to model this kind of stateful interaction but it's not necessarily clearer and would prevent the use of stubs for the state transitions.

[jmock]:http://jmock.org/
[jmock-states]:http://jmock.org/states.html
[goos]:http://www.growing-object-oriented-software.com/
[spock-issue]:http://code.google.com/p/spock/issues/detail?id=130
[strict-order]:http://docs.spockframework.org/en/latest/interaction_based_testing.html#invocation-order
