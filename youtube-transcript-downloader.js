/*!
 * YouTube Transcript Downloader v1.0.0
 * Description: A simple JavaScript snippet for downloading YouTube transcript captions in multiple formats:
 *              WebVTT, SRT, plain text, and the original XML.
 * Usage:       Paste this script in the browser console on a YouTube video page where the ytplayer object is available.
 *              Call yttd.getVTT(), yttd.getSRT(), yttd.getText(), or yttd.getXML() to download the transcript in the desired format.
 * Author:      https://github.com/joegasper
 * License:     MIT
 */

const yttd = (function () {
    function downloadFile(content, filename) {
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }

    function decodeHTMLEntities(text) {
        return text
            .replace(/&#(\d+);/g, (m, dec) => String.fromCharCode(dec))
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&apos;/g, "'");
    }

    function formatTime(timeInSec, useComma) {
        const hours = Math.floor(timeInSec / 3600);
        const minutes = Math.floor((timeInSec % 3600) / 60);
        const seconds = Math.floor(timeInSec % 60);
        const milliseconds = Math.floor((timeInSec - Math.floor(timeInSec)) * 1000);
        const hh = hours.toString().padStart(2, "0");
        const mm = minutes.toString().padStart(2, "0");
        const ss = seconds.toString().padStart(2, "0");
        const ms = milliseconds.toString().padStart(3, "0");
        const sep = useComma ? "," : ".";
        return hh + ":" + mm + ":" + ss + sep + ms;
    }

    async function fetchTranscript(transcriptUrl) {
        try {
            const response = await fetch(transcriptUrl);
            if (!response.ok) {
                throw new Error("Failed to fetch transcript.");
            }
            const xmlText = await response.text();

            // Create (or reuse) a Trusted Types policy if required.
            let trustedXML = xmlText;
            if (window.trustedTypes && trustedTypes.createPolicy) {
                // Reuse the policy if it already exists.
                if (!window.myTrustedHTMLPolicy) {
                    window.myTrustedHTMLPolicy = trustedTypes.createPolicy('myPolicy', {
                        createHTML: (input) => input
                    });
                }
                trustedXML = window.myTrustedHTMLPolicy.createHTML(xmlText);
            }

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(trustedXML, "text/xml");
            const texts = xmlDoc.getElementsByTagName("text");
            const cues = [];
            for (const el of texts) {
                const start = parseFloat(el.getAttribute("start"));
                const dur = parseFloat(el.getAttribute("dur"));
                const end = start + dur;
                const text = decodeHTMLEntities(el.textContent);
                cues.push({ start, dur, end, text });
            }
            return cues;
        } catch (err) {
            console.error("Error fetching or parsing transcript:", err);
            throw err;
        }
    }

    async function generateTranscript(format, transcriptUrl) {
        const cues = await fetchTranscript(transcriptUrl);
        if (format === "vtt") {
            let content = "WEBVTT\n\n";
            cues.forEach(cue => {
                const start = formatTime(cue.start, false);
                const end = formatTime(cue.end, false);
                content += `${start} --> ${end}\n${cue.text}\n\n`;
            });
            return content;
        } else if (format === "srt") {
            let content = "";
            cues.forEach((cue, index) => {
                const start = formatTime(cue.start, true);
                const end = formatTime(cue.end, true);
                content += `${index + 1}\n${start} --> ${end}\n${cue.text}\n\n`;
            });
            return content;
        } else if (format === "text") {
            return cues.map(cue => cue.text).join(" ");
        }
    }

    function getTranscriptUrl() {
        try {
            const captionTracks = ytplayer?.config?.args?.raw_player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
            if (!captionTracks || captionTracks.length === 0) {
                throw new Error("No captions available for this video.");
            }
            // Example: Select the first English track if available, otherwise use the first track.
            const transcriptUrl = captionTracks.find(track => track.languageCode === "en")?.baseUrl || captionTracks[0].baseUrl;
            return transcriptUrl;
        } catch (err) {
            console.error("Failed to extract transcript URL:", err);
            throw err;
        }
    }

    return {
        getXML: async function () {
            try {
                const transcriptUrl = getTranscriptUrl();
                const response = await fetch(transcriptUrl);
                if (!response.ok) {
                    throw new Error("Failed to fetch transcript.");
                }
                const xmlText = await response.text();
                downloadFile(xmlText, "transcript.xml");
                console.log("XML file downloaded.");
            } catch (err) {
                console.error(err);
            }
        },
        getVTT: async function () {
            try {
                const transcriptUrl = getTranscriptUrl();
                const content = await generateTranscript("vtt", transcriptUrl);
                downloadFile(content, "transcript.vtt");
                console.log("WebVTT file downloaded.");
            } catch (err) {
                console.error(err);
            }
        },
        getSRT: async function () {
            try {
                const transcriptUrl = getTranscriptUrl();
                const content = await generateTranscript("srt", transcriptUrl);
                downloadFile(content, "transcript.srt");
                console.log("SRT file downloaded.");
            } catch (err) {
                console.error(err);
            }
        },
        getText: async function () {
            try {
                const transcriptUrl = getTranscriptUrl();
                const content = await generateTranscript("text", transcriptUrl);
                downloadFile(content, "transcript.txt");
                console.log("Text file downloaded.");
            } catch (err) {
                console.error(err);
            }
        }
    };
})();

// Usage
console.log("YouTube Transcript Downloader is now available. Run the following commands to download transcripts:");
console.log("yttd.getVTT(), yttd.getSRT(), yttd.getText(), or yttd.getXML().");
