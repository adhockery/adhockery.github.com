---
title: 'Styling with HTML5 form validation'
date: 2011-03-25T00:10:00+0000
tags: css, opera, chrome, html5, safari, firefox, webkit
alias: ["post/42903194254/styling-with-html5-form-validation/"]
---

HTML5 specifies a number of enhancements to form inputs that are gradually being implemented by newer browsers. Among the enhancements is support for some level of automatic form validation. When inputs have invalid values the browser may refuse to submit the form. Currently Opera, Safari, Chrome and Firefox 4 have some support for this. IE8 does not. I haven't experimented with IE9 yet.

<!-- more -->

Let's look at [an example][1]. A simple registration form has inputs for the _name_, _email_ and _website_ of a prospective user. Of these _name_ and _email_ are required. The input elements are as follows:

    <input type="text" name="name" required>
    <input type="email" name="email" required>
    <input type="url" name="website">

The `required` attribute is new in HTML5 as are the input types `email` and `url`. All of these have implications for validation. Additionally the new input types, whilst they appear just like regular text inputs in desktop browsers are great for mobile users as they are given optimised virtual keyboard layouts.

CSS3 has `:invalid`, `:required` and `:optional` pseudo-classes that are supported by current versions of Firefox, Chrome, Safari and Opera. Some browsers also refuse to submit the form if a `required` field is not filled in or invalid values are entered in `url` or `email` type fields. Obviously without appropriate feedback this could be a pretty disastrous user experience and thankfully even the Webkit browsers which until recently were blocking form submission without feedback are now handling things better.

* _Firefox 4_, _Opera 11.01_ and _Chrome 10.0.648.204_ all block form submission if there is an empty `required` field or invalid value and display a message next to the first such field.
* _Safari 5.0.4_ will apply `:invalid` CSS rules but allows the form to be submitted.

Applying styles to invalid fields is pretty easy. For example to highlight invalid fields with a red border and background:

    input {
        border: 1px solid #ccc;
    }

    input:invalid {
        background: #fff3f3;
        border-color: #f66;
    }

You can also combine the `:invalid` pseudo-class in combination with others. For example to highlight focused fields with a fancy CSS3 box-shadow:

    input:focus {
        border-color: #99f;
        outline: none;
         -moz-box-shadow: 0 0 0.25em #99f;
      -webkit-box-shadow: 0 0 0.25em #99f;
              box-shadow: 0 0 0.25em #99f;
    }

    input:focus:invalid {
         -moz-box-shadow: 0 0 0.25em #f66;
      -webkit-box-shadow: 0 0 0.25em #f66;
              box-shadow: 0 0 0.25em #f66;
    }

It's worth noting that Firefox 4 automatically adds a red box-shadow to invalid fields (and not just focused ones). To turn it off you can specify:

    input:invalid {
        -moz-box-shadow: none;
    }

Of course, the browsers that display messages when they refuse to submit a form do so with different text and different visual effects so creating a consistent cross-browser look and feel with both client and server side validation messages is going to be an interesting challenge.

[1]: http://inputvalidation.s3-website-us-east-1.amazonaws.com/

