---
title: 'Static analysis and strictness'
date: 2014-06-22T08:27:00+0100
tags: 
alias: post/89533810726/static-analysis-and-strictness/
---

Let me be clear – static analysis tools like Checkstyle and Codenarc are useful tools. But…

<!-- more -->

I don't think you should have overly strict enforcement. There is a small class of static analysis rules that are unambiguous – you're not using that `import`, that `if` block doesn't have braces – but there is a large class of rules that exist in a grey area. Is that method really unused or is it invoked reflectively somewhere? Yes, generally we should declare constants for magic numbers but is it really necessary for the prime seed of a hash code method?

I think the only sane thing to do with those kinds of rule is to enforce them as warnings. What are the alternatives?

1. Clutter up the code with `@SuppressWarning` annotations. If you're doing this I think you've lost sight of why you're using static analysis in the first place. You're making the code harder to read in the interests of detecting errors that can be hard to spot in cluttered code? Er… ok.
2. Put file name and line number references in a rule exceptions file. That's going to be a nuisance to maintain over time and can easily accumulate a cruft of references to rule violations that no longer exist in the code.

The counter-argument is that warnings can build up in the report until it's hard to see the wood for the trees. Okay, but if you really have *that many* violations I think you need to reconsider how much you care about or believe in some of those rules. Turn off or change the configuration of rules you disagree with or break as often as not.

It's not a terrible idea to set a threshold on the number of warnings allowed before the build will fail as a cue to revisit your rule settings.

Static analysis is useful but don't let it be a straight jacket. Use it as a guide by all means but remember sometimes it's wrong and you know better.

**Edit:** Gus Power [tweeted me a response](https://twitter.com/guspower/status/480656135696183296) to this post that I think hits the nail on the head:

> one of those approaches that easily becomes conformity / police enforcement + noisy vs. personally helpful / useful indication

Static analysis is good when it's a tool for helping you write better code. It's bad when it's a “process”-step you're not allowed to disagree with or justify exceptions to or it becomes more of a hinderance than a help.
