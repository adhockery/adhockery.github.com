---
title: 'Ad-Hockery on Tumblr'
date: 2013-02-03T07:53:00+0000
tags: grunt
alias: post/42172874088/ad-hockery-on-tumblr
---

There's nothing more boring than an _"I moved my blog"_ post but a couple of people have actually asked me to write up something about why I chose Tumblr & how I used [Grunt](http://gruntjs.com/) to help me build the theme. So – sorry – here's my _"I moved my blog"_ post…

<!-- more -->

I've been using [Octopress](http://octopress.org/) for my blog for a while now & I've been very happy with it. However, I recently acquired an iPad mini & I'd like to be able to use that to compose & publish blog posts. Whilst composing is no problem using an app like [Byword](http://bywordapp.com/) I need a unix terminal to publish posts when they're ready.

I started looking for a new blogging service that:

* Lets me post **and** edit with [markdown](http://daringfireball.net/projects/markdown/). No hand rolled HTML & no crappy WYSIWYG editor.
* Doesn't require me to host anything myself.
* Allows to keep my domain.
* Allows me to customize the template in a reasonably sane way.
* Supports syntax highlighting. Gist embedding is all very well but gets missed by search bots & mobilizers unless a `noscript` tag is present. I'd rather just use a regular `pre > code` block.
* Enables me to compose & publish posts with my iPad.
* Lets me migrate posts from Octopress. Manually is fine as there aren't *that* many & they're already markdown formatted.
* Lets me keep the same post URLs or specify redirects.
* Supports Disqus comments.

## The candidates

### Blogger and Wordpress.com

No markdown support. No thanks.

### [Posterous](https://posterous.com/)

The future seems in doubt after being acquired by Twitter. Worse, Posterous doesn't allow linking to external scripts which means no Google Code Prettify & I'd lose all my Disqus comments.

### [Calepin](http://calepin.co/)

Recently there's been a trend for Dropbox based micro-blogging services & the first I came across was Calepin. Whilst I was impressed by the simplicity of the setup it does *not* let you customize your blog template. I get why & I think it's a cool service but it's not for me.

### [Skrivr](http://skrivr.com/) and [Markbox](http://www.markbox.io/)

Invite-only (I'm still waiting :-().

### [Scriptogram](http://scriptogr.am/)

Scriptogram seemed like a good fit. Posts are just markdown files in a Dropbox folder. They use a YAML header similar to the one used by Octopress to specify the timestamp, URL slug, tags and so on.

Editing the blog template is a little less convenient, though. It's similar to Tumblr's mechanism where you edit the HTML template and CSS in the browser. In reality this means editing in a text editor then copy & pasting into the browser. It's not ideal but not a total disaster either. However, I found a few limitations with the Scriptogram templates such as the blog strapline being arbitrarily limited to 131 characters & the fact it seemed to be impossible to get the post timestamp in a format that would allow me to include a valid HTML5 `time` tag. Tumblr's templating while similar seemed a lot more mature.

Scriptogram has no facility for defining redirects so I'd have to use a CDN to maintain old post URLs. Worse, posts are served up under `/post/my-post-title` *and* under `/my-post-title`. The latter appears to be a bug & no `canonical` link is rendered in the header to point to the correct URL.

### Tumblr

I already contribute to a Tumblr - [Hipster Dev Stack](http://hipsterdevstack.tumblr.com/), (you probably haven't heard of it) - and find it pretty good for short form blogging. It's also got a decent iOS client that accepts markdown input.

I also like the fact that tumblr allows different post _types_; links, quotes, photos, etc. I'm not sure how much I'll use them on this blog but it's nice to have the option.

Tumblr also ticked the other boxes; I can define redirects so that links to old post URLs won't break, I can include Disqus comments & include external scripts for prettifying code.

## Migrating to Tumblr
### Migrating posts

One thing Tumblr _doesn't_ have is a tool for importing posts from another service so I had to copy & paste my Octopress posts. Tedious but not difficult. Luckily they were all in markdown format anyway and included a timestamp in the header that could be pasted into Tumblr as is.

I used Tumblr's redirect facility to set up redirects from the old post URLs to the new ones. Again this is a tedious manual process but luckily I didn't have _that_ many posts to migrate.

### Syntax highlighting

I linked Google Code Prettify, added a small script block to add the `prettyprint` class to any `pre > code` blocks & copied some CSS rules into my theme.

### Comments

I just had to migrate my [Disqus](http://disqus.com/) comments' URLs. Thankfully *Disqus* makes that pretty easy - you can just upload a CSV file that maps old URLs to new ones.

### Theming

I'd got quite far building a theme for Scriptogram but it was easy to adapt it to Tumblr.

Unlike Scriptogram Tumblr expects you to inline CSS in the HTML template. You can upload and link to a separate file but can't subsequently edit it so that seems like something to do once the bugs are ironed out. I also wanted to use a pre-processor to maintain my sanity. The workflow was initially pretty cumbersome:

* edit LESS file
* compile & pipe output to clipboard
* select existing CSS block in the template and paste over the top
* copy entire template and paste into Tumblr's editor

This got old pretty fast so I decided to automate it a little. I created a [Grunt](http://gruntjs.com/) build file that compiled LESS and merged it into the template HTML. That meant I could run `grunt && cat dist/template.html | pbcopy` and then paste into Tumblr's editor. Still not perfect but the fiddly bit – selecting and pasting over the inline CSS – is gone.

You can check out [the blog theme and its Grunt build](https://github.com/robfletcher/adhockery-tumblr) on GitHub.

I'd like to update the Grunt build to have a _production_ mode that will generate an external CSS file, upload it to Tumblr's CDN and merge a link into the template instead of the inline CSS.

## Conclusion

If it wasn't for the fact I wanted an iOS friendly blog workflow I would have stayed with Octopress. It really is fantastic.

There are some things I don't like about Tumblr. First, the iOS app lets you compose posts in markdown but presents you with the generated HTML if you try to edit them later. I really hope that gets fixed but actually the web editor is perfectly usable on an iPad so it's not a deal-breaker.

If Scriptogram gets some updates to fix the things I wasn't happy with I could imagine moving the blog again as editing plain files on Dropbox is always going to be more flexible than using a proprietary editor be it web or app. 
