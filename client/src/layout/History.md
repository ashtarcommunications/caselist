# A brief history of openCaselist

## The early days (version 1)

Prior to the advent of centralized disclosure, it was common in the NDT/CEDA debate community for teams to maintain their own extensive intel on other team's arguments (a "case list") to aid in preparation. Teams would send scouts to high-profile rounds (usually novices or other young debaters who had been eliminated or weren't competing themselves yet) to manually type (or often, hand-write) the citations for the paper cards read in the debate, for later retrieval.

This self-directed model of intel gathering tended to significantly favor larger teams with more resources. If you brought 30 novices with you to a tournament, you could collect a great deal more info (and therefore be better prepared) than a much smaller team. If you were a school with, say, two debaters and one coach who had to judge all the rounds, you were likely flying blind and rarely had any intel on your opponents at all.

So, in the late 2000's, Wake Forest University pioneered the idea of democratizing access to intel. They set up the first real public case list, which they called the "Open Caselist." Originally, it was thought that most intel would come from people sharing what they had gathered on their opponents, so everyone's combined contributions would be relatively comprehensive. While it's still possible and encourage to submit information about an opponent, this model had morphed somewhat over time, as it became more common for teams to simply self-disclose their arguments, saving everyone the trouble of running around to each round to collect cites, a trend further accelerated by the rise of paperless debating and the ease of disclosing "open source" documents with full-text cards.

In keeping with the idea of community contributions, the original Open Caselist was hosted on a free wiki-hosting website called Wikispaces. A "wiki" is in essence just a website that anyone can openly edit, usually by creating new links to make pages on the fly (rather than a traditional website where all the pages have to be designed in advance).

In the Wikispaces incarnation, each team's Aff and Neg pages were just a single document of text (like a long Google Doc), where they would paste and update cites from each debate. Unfortunately, these early caselists are no longer accessible to shake our heads at the pain of using, as the original maintainers were unable to create backups of the early Wikispaces sites before they were shut down. So, the first few years of centralized disclosure are likely lost to the mists of time (if someone happens to have a backup hanging out on an old CD-ROM or something, please email me!).

Following the college community's example, the NDCA also took the lead a few years later in setting up Wikispaces sites for high school disclosure (these are also unfortunately lost).

By the start of the 2010's, however, it was clear that the Wikispaces version of centralized disclosure was untenable. For one, the site often devolved into complete chaos. There were no real formatting standards, pages were incredibly long and hard to navigate or organize, and many teams didn't bother to maintain them or keep them up to date at all. For another, disclosing open source documents was becoming more and more common, and Wikispaces had only very limited file management capabilities (especially on their free version). It was common for you to end up with 100's of badly named "speech.doc" files on your computer, with no ability to track which rounds or team they'd come from. The writing was also already on the wall that Wikispaces was unlikely to remain free forever, and was even likely to shut down entirely in the near future (which ultimately happened around 2014).

To solve these problems, what was needed was not a "wiki" per se, but a storehouse for structured data.

## The XWiki era (version 2)

So, I built one. The idea behind "structured data" is to provide a common format for tracking metadata about disclosure (which team did it come from, which round, which side, who was the opponent, is there an open source document available?, etc...). Rather than a mish-mash of poorly edited text, all disclosure could instead be easily organized, searched, and archived using the same systme for everyone.

At the time, there were very limited options for free, open source, self-hostable systems that would support structured data storage, including large-scale downloadable file management and community-based open editing, without extensive custom development. Ideally, the system needed to:
* Support structured data storage and metadata
* Allow customization to make it fit with the esoteric needs of the debate community without extensive programming
* Be openly editable by anyone
* Handle large numbers of open source documents
* Allow for robust searching through all the data, including inside the text of uploaded Word documents (no easy feat)
* Support many different caselists for different events/communities year-to-year
* Have a built-in API to allow building integrations, e.g. with Verbatim and Tabroom

After evaluating dozens of different wiki and CMS platforms, there was really only one that fit the bill at the time: XWiki. XWiki is a free, open source wiki platform designed for enterprise users. Crucially, it's extremely extensible and customizable (at least, as far as wiki systems go), and has at least some rudimentary support for storing structured data and handling file attachments.

So, after a few months of work over the summer, I launched an XWiki-based version of openCaselist for the 2011-12 college debate season. While there were some growing pains, I think it was unambiguously a massive improvement over the Wikispaces version. Open source documents had a consistent naming scheme for everyone, page creation and maintenance was much easier, and people could now search the full-text of the caselist, including open source documents. After trying it out at the college level for a couple years, the advantages to this new approach were clear, so by 2014, the NDCA had also agreed to move all the high school disclosure sites over to the new system. Around this time, summer institutes also launched the collaborative Open Evidence Project to share files produced at camps freely for everyone, so I built a separate site into XWiki to support that as well.

While it's hard to compare numbers for certain, over time, openCaselist has become one of, if not the largest, XWiki deployment in the world, encompassing dozens of independent wikis with tens of thousands of unique users, teams, and uploaded documents. It also has to support a level of simultaneous usage that far exceeds the demands placed on, say, a normal enterprise/company wiki. On an average Saturday morning, the wiki can go from 0 to thousands of active users in a matter of minutes (e.g two minutes after the first pairing of the day is released). Given those requirements, it's somewhat surprising that a cobbled together extension of an off-the-shelf open source tool has served the community as well as it has, for as long as it has.

Unfortunately, XWiki also came with some pretty hefty downsides. For one, it's written in Java, which can be a pain to host and is a notorious resource hog, prone to memory leaks and poor performance. All the customizations needed to be built using underpowered and often frustrating Java templating languages (e.g. Groovy), using a built-in editor that lacks all the basic development niceties. For years, it didn't even support syntax highlighting, much less things like version control or the features of a real editor, all of which made custom development tedious and difficult.

More importantly, XWiki turned out to have significant performance issues at scale. At root, these are caused by fundamental shortcomings in XWiki's underlying data model. Firstly, the database schema under the hood is incredibly complex and difficult to work with (for the interested nerds, it stores a lot of stuff in tables partitioned by data type, e.g. strings or ints, rather than some comprehensible domain-specific object mapping). Despite extensive optimization of the code and associated database queries, the data access model built into XWiki meant that the customizations require hundreds of separate database queries on every page load, sometimes slowing things to a crawl or even crashing the site under heavy load. Worse, there is currently no real way to fix it in the existing system - proposed changes to XWiki's data model that might support further optimization have been in limbo for over a decade.

Relatedly, XWiki's support for structured data was never really a great fit for disclosure data. While it does support storing data in a structured way, it lacks any method to store relational data (as would be possible using a real database system). So to support things like linking cites to specific rounds, or round submissions to specific teams, the short version is that I had to create a fake database system under the hood. While functional, that workaround was always doomed to limitations and performance bottlenecks.

Even more crucially, hosting and maintaining the site is done without a dedicated budget. It has been built and run on an entirely volunteer basis. Which puts certain approaches to scaling, like extensive load balancing or running on extremely high-powered hardware, mostly out of reach. We did try hosting XWiki on cloud-based servers for a while to take advantage of better scalability, but it only made the problems worse. Unfortunately, the java code in the XWiki core had subtle problems with Amazon's filesystems, which led to incredibly poor database performance under high load, which also wasn't fixable on our end.

Given the demands placed on the system and the constraints created by trying to fit a square peg (an enterprise wiki) into a round hole (a custom structured data store for a niche community), the only real viable path for improvements in the system long-term was to build something from scratch.

### The modern era (version 3)

To remedy the problems with XWiki, we needed a system with all the same features (structured data, file handling, community editing, full-text search, etc.), but with robust support for relational data and no limitations baked in to the platform. Unfortunately, that still didn't exist.

So, I built one.

Starting with the 2022-23 season, openCaselist is now a custom application, built from scratch using modern software development tools and practices. The interface should still feel familiar and comfotable to long-time users, but with some significant upgrades.

First, the new site is much more performant. While there may be some early growing pains figuring out the best production setup for scaling, in the long run this system will be more stable, less prone to downtime, and much easier to scale both vertically and horizontally to support very high traffic.

Second, it resolves all the main issues with XWiki - structured, relational data is core to the system and designed specifically for housing disclosure data, it has a sane database schema, and it's fortunately not written in Java.

I've also migrated all the data from the old caselists into the new system, so people can take advantage of the new system without losing any community history.

It also comes with a number of new features - automatic parsing of cites from open source documents, built-in support for common workflows like general multi-team disclosures or sharing team contact info, and much closer integration with Tabroom (and eventually, Verbatim) to make disclosure simple and fast. It even has a more robust full-text search engine that makes finding cards easier than ever before. Open Evidence has also been folded into the site, for easy access to thousands of backfiles, all still completely free.

One thing that hasn't changed, is that the site is still created and maintained on a volunteer basis, and without a budget. While the new system will be more stable and a lot easier to use than XWiki, getting to that point has taken many hundreds of hours of development time, and continues to take a significant effort each year for support, maintenance, bug fixes, and feature improvements. To give a sense of scale, the XWiki customizations that ran openCaselist since 2011 were surprisingly accomplished in only around 2500 lines of code, and changed only a little over the years. After all, options in XWiki were limited, so more extensive customization wasn't really possible. The new system is an order of magnitude more complex, with multiple discrete code bases, extensive automated testing, and a great deal more code under the hood.

All of this is to say that if you find a bug, or if a page takes a few extra seconds to load, please be patient and just remember that it could be worse - we could still be hand-writing cites and hoarding intel in our respective team silos.

A final thought - the caselist is a community good, and it's only as good as the information people submit. So do your best to contribute, try to follow the guidelines and keep your cites organized and easy to navigate, and consider submitting cite info in addition to open source documents to make your argument history easier to understand. In general, try and put in more than you take out. If we all work together, we can continue Wake's original vision of democratized access to intel, and help make sure debates focus on content, not just who has the most novices on their squad. That said, remember that this is an opt-in resource, and there's no universal rule or norm for disclosure practices. This is meant as a collective community resource, not a source for cheap wins.

Thanks for reading, and I hope you enjoy the new caselist!

hardy
