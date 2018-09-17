# Contributing to Browsersync

We'd love for you to contribute to Browsersync and help make it even better than it is
today! Here are the guidelines we'd like you to follow:

 - [Question or Problem?](#question)
 - [Issues and Bugs](#issue)
 - [Tips for a creating a great issue report](#tips)
 - [Feature Requests](#feature)
 - [Pull Requests](#pull)
 - [Coding Rules](#rules)
 - [Thank you](#thanks)

## <a name="question"></a> Got a Question or Problem?

If you have questions about how to *use* Browsersync, or about your particular setup, please
ask on [Stack Overflow](http://stackoverflow.com/). We're trying to keep the Issues thread
for actual bugs with code & implementation.

## <a name="issue"></a> Found an Issue?
On that note, if you think you *have* found a bug in Browsersync, please report
it via [Github Issues](https://github.com/BrowserSync/browser-sync/issues).

## <a name="tips"></a> Tips for a creating a great issue report

Whilst we do try to look at each and every issue as soon as possible, there are certain
aspects about your report that will determine how quickly/deeply we'll delve into it. A great
issue will contain at least the following:

* Operating System + Version
* Use case for Browsersync - are you using the built-in server, proxying your own server, or just using the snippet mode?
* Example configuration - show us your full `gulpfile.js`, `Gruntfile.js`, `bs-config.js` or any other code related to how you're using
Browsersync. If we have to respond to your very first issue report with "please provide information about how you're using Browsersync"
then it's very likely to fall to the bottom of the heap. Help us out by providing as much detail as possible!
* Provide a reduced test case. "Browsersync is not working with my app" is far less helpful than "Here's a example project showing the problem".
An example project might contain a single `index.html` file with some JS/CSS from CDNs & a short description of the issue. If we
 can just pull a repo/gist and see the problem for ourselves, your issue will jump straight to the top of the stack.
* Screencast or GIF - not always appropriate, but can be very helpful where possible. (non-issue related gifs are always welcome, we'll often
respond with something from giphy :p)

## <a name="feature"></a> Want a Feature?
You can request a new feature by submitting an issue to our [Github Issues](https://github.com/BrowserSync/browser-sync/issues) page.
Prefix the title of your issue with "Feature Request:".

## <a name="docs"></a> Want a Doc Fix?
Head over to the [Browsersync Website Repo](https://github.com/BrowserSync/browsersync.github.io) & submit issues there.

## <a name="pull"></a> Submitting a Pull Request
Pull requests should always be branched off the main **Master** branch. (There's no guarantee that what lives on the develop
branch will ever make it back to master, I do a **lot** of experimentation).

**Never** commit directly to the master branch, instead create a new branch and submit a PR. This applies to users who have write access also.

**Note:** If your first PR is merged, you'll get write access to all Browsersync repos.

## <a name="rules"></a> Coding Advice
To ensure consistency throughout the source code, keep these rules in mind as you are working. 

* If you're not sure how to provide tests for a feature or bug fix, you should still submit it and we'll help you complete the PR in one of the following ways:
  * we can advise you how to go about it
  * we can write the test, and then explain them to you.
* This project has a [.editorconfig](.editorconfig) file to help with code style; go to [EditorConfig.org](http://editorconfig.org) and download the plugin for your IDE.
* Don't introduce any extra 3rd party libraries unless you're creating a brand new feature that requires it.
* Try to keep your code simple and readable.
* Improve my code! Browsersync has a lot of moving parts and I don't pretend to be skilled in any particular area.
If *you* have particular experience though, then feel free to rip my code apart and tell me a better way to do something - I'll be extremely grateful (as will the growing number of users!).

## <a name="thanks"></a> Thank you!
If you contribute to Browsersync, or any other Open Source project, you're awesome! This project has been vastly improved
 by community input & contributions and we look forward to continuing that trend.
