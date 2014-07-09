---
title: 'Parameterized specs with Jasmine'
date: 2013-05-21T13:49:01+0100
tags: javascript, jasmine, testing
alias: post/50986014902/parameterized-specs-with-jasmine
---

Spock's *where* block makes testing similar conditions for a bunch of inputs very straightforward. Recently I was working on the Groovy language definition for the [Prism syntax highlighter][7] and wanted something similar.

I used [Jasmine][8] to test-drive my code and wanted to be able to make some very similar assertions about how the highlighting operated. For example, a particular code block should contain particular characters highlighted as *operator* tokens. The assertions for each of Groovy's (many) operator types would look extremely similar with the only variance being the *id* of the code block and the expected operator tokens. Using Spock this would be a classic case for writing a single specification method and applying a *where* block.

<!-- more -->

What I *didn't* want to do was write test code like this:

	#!javascript
	it('should highlight Groovy operators', function() {
		var operators = {
			'elvis': '?:',
			'spaceship': '<=>',
			'firecracker': '==~'
		};
		
		for (op in operators) {
			var tokens = $('#' + op).find('.operator').text();
			expect(tokens).toBe(operators[op]);
		}
	});
	
Which would fail fast if any operator wasn't highlighted correctly. Or this:

	#!javascript
	it('should highlight the elvis operator', function() {
		var tokens = $('#elvis').find('.operator').text();
		expect(tokens).toBe('?:');
	});

	it('should highlight the spaceship operator', function() {
		var tokens = $('#spaceship').find('.operator').text();
		expect(tokens).toBe('<=>');
	});

	it('should highlight the firecracker operator', function() {
		var tokens = $('#firecracker').find('.operator').text();
		expect(tokens).toBe('==~');
	});
	
Which would make life painful when I (inevitably) decide I want to implement the test a different way or discover that there's a bug in the implementation.

Jasmine doesn't support anything like Spock's *where* block directly but its specs are created by calling the `it` method and passing a description and a function that asserts the required behaviour. In theory there's no reason why you can't set up a looping construct and call `it` repeatedly.

The function that you pass to `it` does not take any parameters and a naïve implementation like this fails:

	#!javascript
	var operators = {
		'elvis': '?:',
		'spaceship': '<=>',
		'firecracker': '==~'
	};
	
	for (op in operators) {
		it('should highlight the ' + op + ' operator', function() {
			var tokens = $('#' + op).find('.operator').text();
			expect(tokens).toBe(operators[op]);
		});
	}
	
The reason for this is similar to [something I blogged about recently in relation to Groovy][1]. The loop parameter is a mutable reference so although three specifications are set up by the repeated calls to `it` they are all operating on the last value of the loop parameter when they run. In other words with this example the output would be…

	'should highlight the firecracker operator'
	'should highlight the firecracker operator'
	'should highlight the firecracker operator'

The same assertion gets run multiple times.

What we need to do is bind the loop parameters to a closure scope that is retained when the specification function is run. To do this I set up and immediately run an anonymous function inside the loop.

	#!javascript
	for (op in operators) {
		(function(name, tokens) {
			it('should highlight the ' + name + ' operator', function() {
				var tokens = $('#' + name).find('.operator').text();
				expect(tokens).toBe(tokens);
			});
		})(op, operators[op]);
	}

Now we have a closure for each iteration of the loop with the variables `name` and `symbol` which is retained in the scope of the specification function when it runs.

There's nothing special about the parameter object itself, I've used a plain object because I just need two parameters. You could use the same technique with any number of parameters by using an array or some other construct. The parameters just need to be declared on and passed to the anonymous function that creates the closure.

## More…

You can see the Prism Groovy language definition [here][3]. The Jasmine tests are executed right in the page. The [specification code itself][4] is found in the GitHub repository.

If you're interested in a Jasmine extension that wraps this kind of parameterization in an API then check out [Neckbeard.js][6].
	
For more on JavaScript closures and anonymous functions I recommend [Secrets of the JavaScript Ninja][2] by John Resig and Bear Bibeault.

[1]:http://blog.freeside.co/post/46587122020/groovy-gotcha-for-loops-and-closure-scope
[2]:http://www.manning.com/resig/
[3]:http://freeside.co/prism-groovy/
[4]:https://github.com/robfletcher/prism-groovy/blob/gh-pages/test/prism-groovy.spec.js
[6]:http://htmlpreview.github.io/?https://raw.github.com/desirable-objects/neckbeard.js/master/website/index.html
[7]:http://prismjs.com/
[8]:https://github.com/pivotal/jasmine
