# Frequently Asked Questions

## How do I format my speech doc so my cites are automatically detected?
The auto-cite feature is based on the heading levels in your document. It will assume that the largest heading level in the document is the heading to use to split the document into cite entries. So if you only have Blocks (Heading 3), it will create a cite entry for each block title. If you use a Hat (Heading 2) or a Pocket (Heading 1), it will split the document on those headings instead. So, as long as you organize your document logically using a consistent heading level for where you want it to split each cite entry, it should work.

## How do I remove myself/opt out from the caselist?
If you already have a school/team you want deleted, you'll need to [Contact us](https://paperlessdebate.com#contact). Make sure to specify which caselist, year, and team/school. We don't automate deletions to avoid shenanigans.

## What tech stack do you use?
The front-end is a React app. The back-end is built in NodeJS. The search functions are built with Apache Solr for indexing cites and documents, and Apache Tika for full-text extraction.
