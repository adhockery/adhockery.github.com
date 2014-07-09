---
title: 'Git and Hudson'
date: 2009-11-02T10:48:00+0000
tags: ubuntu, hudson, git
alias: ["post/42902614843/git-and-hudson/"]
---

I just encountered a rather annoying problem when running [Hudson][1] as a service on [Ubuntu][2]. I was getting the following exception whenever the build checked code out of [GitHub][3]:

    hudson.plugins.git.GitException: Could not apply tag hudson-Selenium_RC_Plugin-23
     at hudson.plugins.git.GitAPI.tag(GitAPI.java:265)

It turns out Git needs a username to be set and the hudson user that the Debian package creates when Hudson is installed doesn't have one. Easily fixed by using `sudo nano /etc/passwd` to add `Hudson,,,` into the hudson user's entry (if you look at your own entry you should see where it needs to go).

[1]: http://hudson-ci.org/
[2]: http://ubuntu.com/
[3]: http://github.com/

