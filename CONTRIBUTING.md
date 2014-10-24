#Contributing to BrowserSync

We'd love for you to contribute to BrowserSync and help make it even better than it is
today! Here are the guidelines we'd like you to follow:

 - [Question or Problem?](#question)
 - [Issues and Bugs](#issue)
 - [Tips for a creating a great issue report](#tips)
 - [Feature Requests](#feature)
 - [Pull Requests](#pull)
 - [Coding Rules](#rules)
 - [Thank you](#thanks)

## <a name="question"></a> Got a Question or Problem?

If you have questions about how to *use* BrowserSync, or about your particular setup, please
ask on [Stack Overflow](http://stackoverflow.com/). We're trying to keep the Issues thread
for actual bugs with code & implementation.

## <a name="issue"></a> Found an Issue?
On that note, if you think you *have* found a bug in BrowserSync, please report
it via [Github Issues](https://github.com/shakyShane/browser-sync/issues).

## <a name="tips"></a> Tips for a creating a great issue report

Whilst we do try to look at each and every issue as soon as possible, there are certain
aspects about your report that will determine how quickly/deeply we'll delve into it. A great
issue will contain at least the following:

* Operating System + Version
* Use case for BrowserSync - are you using the built-in server, proxying your own server, or just using the snippet mode?
* Example configuration - show us your full `gulpfile.js`, `Gruntfile.js`, `bs-config.js` or any other code related to how you're using
BrowserSync. If we have to respond to your very first issue report with "please provide information about how you're using BrowserSync"
then it's very likely to fall to the bottom of the heap. Help us out by providing as much detail as possible!
* Provide a reduced test case. "BrowserSync is not working with my app" is far less helpful than "Here's a example project showing the problem".
An example project might contain a single `index.html` file with some JS/CSS from CDNs & a short description of the issue. If we
 can just pull a repo/gist and see the problem for ourselves, your issue will jump straight to the top of the stack.
* Screencast or GIF - not always appropriate, but can be very helpful where possible. (non-issue related gifs are always welcome, we'll often
respond with something from giphy :p)

## <a name="feature"></a> Want a Feature?
You can request a new feature by submitting an issue to our [Github Issues](https://github.com/shakyShane/browser-sync/issues) page.
Prefix the title of your issue with "Feature Request:".

## <a name="docs"></a> Want a Doc Fix?
Head over to the [BrowserSync Website Repo](https://github.com/shakyShane/browser-sync-website) & submit issues there.

## <a name="pull"></a> Submitting a Pull Request
Pull requests should be branched off the main Master branch. (There's no guarantee that what lives on the develop
branch will ever make it back to master, I do a **lot** of experimentation)

## <a name="rules"></a> Coding Rules
To ensure consistency throughout the source code, keep these rules in mind as you are working:

* All features or bug fixes **must be tested** by one or more [specs](https://github.com/shakyShane/browser-sync/tree/master/test/specs).
* Don't be put off by this, I'm more than happy to help you implement tests - so don't be shy! I'd much rather spend time helping
you to provide tests than risk losing you as a contributor :)
* Follow the code style (Builds will fail if you don't, check at any time with `npm test`). Also, this project has a [.editorconfig](.editorconfig) file to help with code style; go to [EditorConfig.org](http://editorconfig.org) and download the plugin for your IDE.
* Don't introduce any extra 3rd party libraries unless you're creating a brand new feature that requires it.
* Don't fight async! Avoid promises or any other similar types of abstraction, BrowserSync loves simple
callbacks and events.
* Keep your code simple and readable. If I can't tell what it's doing at first glance, it's too complex.
* Improve my code. BrowserSync has a lot of moving parts and I don't pretend to be skilled in any particular area.
If *you* have particular experience though, then feel free to rip my code apart and tell me a better way to do something - I'll be
extremely grateful (as will the growing number of users!).


## <a name="thanks"></a> Thank you!
If you contribute to BrowserSync, or any other Open Source project, you're awesome! This project has been vastly improved
 by community input & contributions and we look forward to continuing that trend.
