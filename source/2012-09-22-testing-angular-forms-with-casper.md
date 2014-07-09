---
title: 'Testing Angular forms with Casper'
date: 2012-09-22T14:27:00+0100
tags: casperjs, angularjs, testing
alias: post/41774715101/testing-angular-forms-with-casper/
---

When testing an [Angular](http://angularjs.org) application using [Casper](http://casperjs.org/) I found that the binding between inputs and model didn't seem to be happening when I filled in form fields. I used Casper's [`fill`](http://casperjs.org/api.html#casper.fill) method but found that the Angular form validation was rejecting any required fields as though they were still blank. With some debugging I was able to see that the `$scope` variables indeed weren't getting updated.

<!-- more -->

At first I figured I might need to trigger a _change_, _blur_ or _keyup_ event or something but after some digging in the Angular source I figured out that Angular uses a custom _input_ event to trigger a refresh of the model. When Casper sets the form field values the event isn't triggered so Angular doesn't _"see"_ the change.

To work around this I just overrode the `fill` method such that after writing a value to each field it triggers the _input_ event as well:

	#!coffeescript
	casper.fill = (selector, values, submit = false) ->
	    @evaluate (selector, values) ->
	        $("#{selector} [name='#{name}']").val(value).trigger('input') for name, value of values
	    ,
	        selector: selector
	        values: values

Now everything works just fine.

If you want to see this code in context it's part of my [Grails Angular Scaffolding plugin](http://grails-ng.cloudfoundry.com/). The `fill` override is in a [Coffeescript extension file](https://github.com/robfletcher/grails-angular-scaffolding/blob/master/test/apps/grails-ng/test/casper/includes/casper-angular.coffee#L2).

This technique should also be applicable to any other [Phantom](http://phantomjs.org/) based tool such as [Webspecter](https://github.com/jgonera/webspecter).

