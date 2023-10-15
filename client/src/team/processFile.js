/* istanbul ignore file */
import * as mammoth from 'mammoth/mammoth.browser';
import Turndown from 'turndown';
import { toast } from 'react-toastify';

const processFile = (
    acceptedFiles,
    setFiles,
    autodetect,
    removeEmptyCites,
    setProcessing,
    setFileContent,
    append
) => {
    setFiles(acceptedFiles);
    acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        const turndown = new Turndown({ headingStyle: 'atx' });
        turndown.remove(['style', 'script', 'img', 'figure', 'area', 'audio', 'map', 'track', 'video', 'embed', 'iframe', 'object', 'picture', 'portal', 'source', 'svg', 'math', 'canvas', 'noscript', 'form', 'button', 'details', 'dialog', 'summary', 'slot', 'template']);

        reader.onabort = () => console.log('File reading was aborted');
        reader.onerror = () => console.log('File reading has failed');
        reader.onload = async () => {
            // Show processing indicator
            setProcessing(true);

            // Convert the file contents into HTML
            const binaryStr = reader.result;

            // Always convert to base64 for upload, even if not using cite detection
            let binary = '';
            const bytes = new Uint8Array(binaryStr);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            setFileContent(window.btoa(binary));

            if (!autodetect) {
                setProcessing(false);
                return false;
            }

            let html;
            try {
                const result = await mammoth.convertToHtml(
                    { arrayBuffer: binaryStr },
                    {
                        ignoreEmptyParagraphs: true,
                        convertImage: mammoth.images.imgElement(() => {
                            return {
                                // Transparent 1x1 gif
                                src: `data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==`,
                                alt: 'Image removed',
                            };
                        }),
                    },
                );
                html = result.value;
            } catch (err) {
                setProcessing(false);
                console.log(err);
                toast.error('File could not be processed for cites. Are you sure this is a Verbatim file?');
                return false;
            }
            if (html.length > 1000000) {
                toast.warn('This looks like a very large file, which may slow down your browser. Are you sure it\'s a speech document?');
            }

            // Put the HTML string into a DOM element so we can manipulate as an array
            const div = document.createElement('div');
            div.innerHTML = html;
            const elements = [...div.children];

            if (
                elements[0]?.textContent?.trim()?.charAt(0) === '#'
                || elements[0]?.textContent?.trim()?.charAt(0) === '='
            ) {
                setProcessing(false);
                toast.warn('Auto-detecting cites failed - this file appears to have already been wikified in Verbatim! Auto-detection only works on unconverted files.');
                return false;
            }

            // Combine <p> tags so each cite + card is in one element
            // Iterates through array backwards, merges <p> into previous element if also a <p>
            for (let i = elements.length - 1; i >= 0; i--) {
                if (elements[i].tagName === 'P' && elements[i - 1] && elements[i - 1].tagName === 'P') {
                    elements[i - 1].innerHTML = `${elements[i - 1].innerHTML}<br>${elements[i].innerHTML}`;
                    elements.splice(i, 1);
                }
            }

            // Truncate the text of each card to keep them readable
            elements.forEach(e => {
                // Skip headers, we only want to deal with the card text
                if (e.tagName !== 'P') { return false; }

                // Convert the cite + card text into an array of paragraphs
                // so we can identify the cite vs the card
                const paragraphs = e.innerHTML.split('<br>');

                // If there's less than 2 paragraphs, something is off and we don't have
                // a cite + card, so abort
                if (paragraphs.length < 2) { return false; }

                // Most people use 2-line cites, so default to card starting on 3rd paragraph
                let startOfCardIndex = 2;

                // If there are exactly two paragraphs, the first is almost always the cite,
                // so truncate the second paragraph as the card
                if (paragraphs.length === 2) {
                    startOfCardIndex = 1;
                }

                // If the first paragraph has a URL, it's probably a one-line cite
                if (paragraphs[0].indexOf('http://') !== -1
                    || paragraphs[0].indexOf('https://') !== -1
                ) {
                    startOfCardIndex = 1;
                }

                // If the first paragraph has more than one double quote,
                // it's probably a one line cite
                if ((paragraphs[0].match(/"/g) || []).length > 1
                    || (paragraphs[0].match(/”/g) || []).length > 1
                ) {
                    startOfCardIndex = 1;
                }

                // Truncate the full card text to 25 words start/end
                let fullText = paragraphs.slice(startOfCardIndex).join(' ');
                const words = fullText.split(' ');
                if (words.length > 50) {
                    fullText = words
                        .slice(0, 25)
                        .join(' ')
                        .concat('<br />AND<br />')
                        .concat(words.slice(-25).join(' '));
                }

                // Replace the card text with the truncated cite version and delete
                // the rest of the paragraphs
                paragraphs[startOfCardIndex] = fullText;
                paragraphs.length = startOfCardIndex + 1;

                // Put the card back together into the DOM element
                e.innerHTML = paragraphs.join('<br>');
            });

            // Convert the array of elements back to a string so we can split it into entries
            const processedHTML = elements
                .map(e => e.outerHTML)
                .join('');

            // Split cites on the largest heading level in doc, or block titles by default
            let headerToSplit = '<h3>';
            if (processedHTML.indexOf('<h2>') > -1) { headerToSplit = '<h2>'; }
            if (processedHTML.indexOf('<h1>') > -1) { headerToSplit = '<h1>'; }
            const citeEntries = processedHTML.split(headerToSplit)
                .map(x => `${headerToSplit}${x}`)
                .filter(x => x !== headerToSplit);

            // Convert each entry into markdown and add to cites array
            citeEntries.forEach((entry) => {
                const markdown = turndown.turndown(entry);
                append({ title: markdown.split('\n')[0].replace('#', '').trim(), cites: markdown, open: false });
            });

            // Remove empty or placeholder cites
            removeEmptyCites();

            // Stop showing processing indicator
            setProcessing(false);
        };
        reader.readAsArrayBuffer(file);
    });
};

export default processFile;
