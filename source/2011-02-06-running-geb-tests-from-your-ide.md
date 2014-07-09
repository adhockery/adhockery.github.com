---
title: 'Running Geb tests from your IDE'
date: 2011-02-06T15:02:00+0000
tags: geb, testing, intellij
alias: post/42903139504/running-geb-tests-from-your-ide
---

A frequent complaint about functional testing in Grails is that the start up / shut down cycle time of the app makes prototyping a functional test prohibitive. There has been some recent progress in this are with Luke Daley's [Functional test development plugin][1] but it would be really nice to be able to just run functional tests from inside your IDE in the same way as a similar unit test.

With Geb and IntelliJ Idea at least this is actually pretty straightforward (I'm sure the same thing is possible with Eclipse/STS I'm just not familiar enough with it).

<!-- more -->

Geb's dependence on the Grails lifecycle is pretty minimal so the tests can run without needing any magic to happen in any __Events_ scripts (unlike the Selenium RC plugin where this would be significantly more difficult). One extra step _is_ required; the Grails Geb plugin normally picks up its base URL from Grails configuration and the test will not be running in the same JVM as the Grails app if it runs from the IDE so configuration will not be available. Just add the following method to your test that extends _GebTests_ or _GebSpec_ (or add it to a base class):

    @Override String getBaseUrl() {
        super.baseUrl ?: "http://localhost:8080"
    }

Now Geb will use the Grails configured base URL if it _is_ in the same JVM as the app or default to `http://localhost:8080` otherwise (obviously you need to change that default if that's not the host or port where your app runs).

You can then just run up the app from the command line, open the test in IntelliJ and hit <kbd>Ctrl + Shift + F10</kbd> to run it. When the test completes the app is still running so you can make changes & run again with minimal turnaround time. Since the app is running in development mode you can make application changes without a server restart as well.

IntelliJ Idea's test integration is pretty good and it even groks Spock specifications. You can also debug and step through the test. The only downside is that you can't directly access domain classes or other application components in the test as they are only available from the app's JVM.

[1]: http://www.grails.org/plugin/functional-test-development

