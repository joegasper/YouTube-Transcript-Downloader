# YouTube Transcript Downloader

This project provides a simple JavaScript snippet that downloads YouTube transcript captions in multiple formats: WebVTT, SRT, plain text, and JSON. It works by intercepting the transcript data that YouTube's own UI fetches when you open the transcript panel, parsing the response, and converting it into the desired format before triggering a file download.

## Features

- **Download WebVTT:** Creates a properly formatted WebVTT file.
- **Download SRT:** Exports the transcript in SubRip (SRT) format.
- **Download Plain Text:** Joins all caption text with spaces to create a plain text file.
- **Download JSON:** Exports the transcript as a JSON array with start time, end time, and text for each segment.
- **Preview:** Displays the first few transcript segments as a table in the console.
- **Reset:** Clears the captured transcript so you can re-capture after navigating to a new video.

## How It Works

1. **Intercept Transcript Request:** When you open YouTube's transcript panel, YouTube makes a POST request to its internal `youtubei/v1/get_transcript` API. The script installs a `fetch()` interceptor that catches this response automatically.
2. **Parse Response:** The JSON response is parsed to extract each caption segment's start time (ms), end time (ms), and text content.
3. **Format Time:** A helper function converts milliseconds to either `HH:MM:SS.mmm` (for WebVTT) or `HH:MM:SS,mmm` (for SRT) format.
4. **Download Files:** Depending on the function called, the script converts the captured transcript data into the desired format and triggers a file download.

## Usage

1. Navigate to the YouTube video page.
2. Open your browser's JavaScript console via Developer Tools. Right-click anywhere on the page and select "Inspect" or press F12 / Ctrl+Shift+I, then go to the "Console" tab.
3. Paste the [complete code](./yttd.js) into the console and press Enter. The first time, you may need to type `allow paste` and press Enter before pasting.
4. Open the YouTube transcript panel by clicking the `...` menu below the video and selecting **"Show transcript"**. Wait for the message `yttd: Transcript ready! X segments captured.` to appear in the console.
5. Enter one of the following commands in the console and press Enter:
   - `yttd.getVTT()` — download a WebVTT file.
   - `yttd.getSRT()` — download an SRT file.
   - `yttd.getText()` — download a plain text file.
   - `yttd.getJSON()` — download a JSON file.
   - `yttd.getPreview()` — preview the first 5 segments as a table in the console (optionally pass a number, e.g. `yttd.getPreview(10)`).
   - `yttd.reset()` — clear the captured transcript and re-capture from the transcript panel (useful when navigating to a new video without a full page reload).

## Notes

- The script must be pasted **before** opening the transcript panel, as it needs to intercept the network request when it is made.
- If you navigate to a new video in the same tab, run `yttd.reset()` and re-open the transcript panel to capture the new video's transcript.
- The transcript panel must be available for the video (i.e., the video must have captions enabled).
