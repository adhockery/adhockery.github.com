---
title: 'Groovy gotchas: overloading the assignment operator'
date: 2013-03-29T15:42:07+0000
tags: groovy
alias: post/46597838031/groovy-gotchas-overloading-the-assignment-operator
---

When assigning to a property of an object in Groovy using the assignment operator `=`  Groovy will look for a bean property style setter method. For example `x.foo = y` is equivalent to `x.setFoo(y)`. Or is it?

<!-- more -->

Since meta-methods can be overloaded with different parameter types what will be printed to *sysout* if we run this script? (Remember that Groovy - unlike Java - dispatches to the *most specific* applicable method signature).

	#!groovy
	Object.metaClass.with {
	    setFoo = {
	        println "setFoo(Object)"
	    }
	    setFoo = { String s ->
	        println "setFoo(String)"
	    }
	}

	def o = new Object()
	o.setFoo("foo")
	o.setFoo(o)
	o.foo = "foo"
	o.foo = o

Copy & paste this into the Groovy REPL or [try it on the Groovy Web Console][ex1]. I think you may be surprised.

It seems like the operator form will always dispatch to the *last* implementation attached to the meta class regardless of parameter types whereas the method form will dispatch "correctly".

When I first encountered this problem I assumed it was a peculiarity of meta class usage but actually it's not. Consider this example:

	#!groovy
	class Fnord {
	    void setFoo(Fnord o) {
	        println "setFoo(Fnord)"
	    }
	    void setFoo(String s) {
	        println "setFoo(String)"
	    }
	}

	def o = new Fnord()
	o.setFoo("foo")
	o.setFoo(o)
	o.foo = "foo"
	o.foo = o

[Try it yourself on the Groovy Web Console][ex2].

The result is the same: the operator form dispatches to the *last* declared version of the method rather than the one that matches the type of the right hand side of the expression.

In both these examples I've used a String parameter on the last variant of the method. Anything can be coerced to String automatically by Groovy so although the result is not what I expected no exception is thrown. What if [the method declarations in the last example are reversed][ex3], though?

Oh.

	org.codehaus.groovy.runtime.typehandling.GroovyCastException: Cannot ocast object 'foo' with class 'java.lang.String' to class 'Fnord'

Looking at the stacktrace there it looks like this problem might be down to the fact that the assignment operator is not, in fact, a simple alias to the setter but uses [`GroovyObject.setProperty`][api].

[ex1]:http://groovyconsole.appspot.com/script/931001
[ex2]:http://groovyconsole.appspot.com/script/932001
[ex3]:http://groovyconsole.appspot.com/script/931002
[api]:http://groovy.codehaus.org/api/groovy/lang/GroovyObject.html#setProperty(java.lang.String,%20java.lang.Object)