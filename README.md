# YouTube Transcript Downloader

This project provides a simple JavaScript snippet that downloads YouTube transcript captions in three different formats: WebVTT, SRT, and plain text. It works by fetching the transcript XML (also available to download) from an available YouTube video's player object (ytplayer), decoding any HTML entities, and converting the data into the desired format before triggering a file download.

## Features

- **Download WebVTT:** Creates a properly formatted WebVTT file.
- **Download SRT:** Exports the transcript in SubRip (SRT) format.
- **Download Plain Text:** Joins all caption text with spaces to create a plain text file.
- **Download XML:** Downloads the transcript's source XML file.
- **HTML Entity Decoding:** Converts escaped HTML characters (e.g., &#39;) to their actual character representation.

## How It Works

1. **Fetch Transcript:** The script uses the `fetch()` API to retrieve the YouTube transcript XML using the URL provided by the ytplayer object.
2. **Parse XML:** It then parses the XML to extract each caption with its start time, duration, and textual content.
3. **Decode HTML Entities:** A helper function decodes any HTML entities found in the transcript to ensure correct character encoding.
4. **Format Time:** Another helper function converts seconds to either `HH:MM:SS.mmm` (for WebVTT) or `HH:MM:SS,mmm` (for SRT) format.
5. **Download Files:** Depending on the function called (`getVTT()`, `getSRT()`, or `getText()`), the script converts the transcript data into the desired format and triggers a file download.

## Usage

1. Navigate to the YouTube video page (where the `ytplayer` object is available).
2. Open your web browser's JavaScript console by accessing the Developer Tools. On most browsers, right-click anywhere on the page and select "Inspect" or "Inspect Element," then navigate to the "Console" tab. Alternatively, you can typically press F12 or Ctrl+Shift+i to open the Developer Tools directly.
3. Paste the [complete code](./youtube-transcript-downloader.js) into the console and press Enter. The first time, you may need to enter "allow paste" and press Enter in the console.
4. To download the transcript, in the console, enter one of the following commands and press Enter:
   - `yttd.getVTT()` for a WebVTT file.
   - `yttd.getSRT()` for an SRT file.
   - `yttd.getText()` for a plain text file.
   - `yttd.getXML()` for the source XML file.

Each function will process the transcript and automatically download the respective file format.
