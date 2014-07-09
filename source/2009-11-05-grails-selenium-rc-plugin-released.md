---
title: 'Grails Selenium RC Plugin Released'
date: 2009-11-05T20:58:00+0000
tags: selenium, testing, grails plugins
alias: post/42902648976/grails-selenium-rc-plugin-released
---

I've finally got the first release of the Selenium RC plugin out of the door. Just run `grails install-plugin selenium-rc` to install.

For anyone unfamiliar with [Selenium RC][1] basically the plugin allows you to write and run Selenium tests in Groovy to functionally test Grails apps using a real browser. The tests run in the functional phase using `grails test-app` or `grails test-app -functional`.

<!-- more -->

In terms of compatibility there is a very minor issue with Safari and some slightly more annoying ones with IE - all of which the plugin's default configuration will work around for you. Unfortunately Firefox 3.5 on OSX Snow Leopard doesn't want to play at all due to an [open Selenium bug][2]. Firefox on other platforms, Google Chrome and Opera all appear to be 100% compatible.

I've tried to make writing the tests themselves as similar to regular Grails unit and integration testing as possible. Not only that, if you have the [Spock plugin][3] installed you can write your Selenium tests as Spock Specifications.

Documentation is [here][4], source code is on [GitHub][5] and issues and feature requests can be raised on [Codehaus' JIRA][6]. I've got plenty of things to work on for future releases such as Selenium Grid integration and automatic screen-grabbing when assertions fail.

[1]: http://selenium-rc.seleniumhq.org/
[2]: http://jira.openqa.org/browse/SRC-743
[3]: http://grails.org/plugin/spock
[4]: http://grails.org/plugin/selenium-rc
[5]: http://github.com/robfletcher/grails-selenium-rc
[6]: http://jira.codehaus.org/browse/GRAILSPLUGINS/component/14229

