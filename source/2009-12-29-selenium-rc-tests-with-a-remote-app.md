---
title: 'Selenium RC tests with a remote app'
date: 2009-12-29T12:18:00+0000
tags: selenium, grails plugins
alias: post/42902733548/selenium-rc-tests-with-a-remote-app
---

I've just released a new snapshot of the [Selenium RC plugin][1]. The main new feature is the ability to run your Selenium tests against a running instance of your application instead of having the application start and stop as part of the test phase. A number of people have requested this. It's really useful for CI environments where you may want to start the app up on a different server from where the tests are being run.

<!-- more -->

All you need to do is set `selenium.remote = true` in your _SeleniumConfig.groovy_ and set `selenium.url` to the root URL of the server where the app is running. Once this is done you can run tests as normal (note: when remote mode is used Selenium tests run in the _other_ phase rather than the _functional_ phase).

The _really_ useful thing is that _SeleniumConfig.groovy_ can contain environment blocks just as other Grails config files can. This means you can enable remote mode in your CI environment but continue to test as normal locally. For example:

    selenium {
        remote = false
        // etc.
    }

    environments {
        hudson {
            selenium.remote = true
            selenium.url = "http://my.test.server/"
        }
    }

The plugin release is a snapshot so you need to specify the version explictly: `grails install-plugin selenium-rc 0.2-SNAPSHOT` and you need to be using Grails 1.2.

[1]: http://grails.org/plugin/selenium-rc

