/*!
 * YouTube Transcript Downloader v2.0.0
 * Description: Downloads YouTube transcripts by intercepting the youtubei/v1/get_transcript
 *              API call that YouTube's own UI makes when you open the transcript panel.
 * Usage:       1. Paste this script in the browser console on a YouTube video page.
 *              2. Open the transcript panel in YouTube's UI (click '...' under video > 'Show transcript').
 *              3. Once "Transcript ready!" appears, enter in the console yttd.getVTT(), yttd.getSRT(),
 *                 yttd.getText(), or yttd.getJSON() to download.
 *                 Run yttd.getPreview() to see the first few transcript segments.
 * Author:      https://github.com/joegasper
 * License:     MIT
 */

const yttd = (function () {

    let capturedCues = null;

    // ── Intercept YouTube's own get_transcript POST call ──────────────────────
    (function installInterceptor() {
        const origFetch = window.fetch;
        window.fetch = async function (...args) {
            const url = args[0]?.url || args[0] || "";
            if (typeof url === 'string' && url.includes('get_transcript')) {
                const response = await origFetch.apply(this, args);
                const clone = response.clone();
                clone.json().then(data => {
                    try {
                        const segments = data
                            ?.actions?.[0]
                            ?.updateEngagementPanelAction
                            ?.content
                            ?.transcriptRenderer
                            ?.content
                            ?.transcriptSearchPanelRenderer
                            ?.body
                            ?.transcriptSegmentListRenderer
                            ?.initialSegments;

                        if (!segments || segments.length === 0) {
                            console.warn("yttd: get_transcript intercepted but no segments found.");
                            return;
                        }

                        capturedCues = segments.map(s => {
                            const r = s.transcriptSegmentRenderer;
                            const startMs = parseInt(r.startMs);
                            const endMs   = parseInt(r.endMs);
                            const text    = r.snippet.runs.map(run => run.text).join(" ");
                            return {
                                start: startMs / 1000,
                                end:   endMs   / 1000,
                                text
                            };
                        });

                        console.log(`yttd: Transcript ready! ${capturedCues.length} segments captured.`);
                        console.log("yttd: Run yttd.getVTT() | yttd.getSRT() | yttd.getText() | yttd.getJSON() | yttd.getPreview() | yttd.reset()");
                    } catch (err) {
                        console.error("yttd: Error parsing transcript response:", err);
                    }
                }).catch(err => console.error("yttd: Error reading response JSON:", err));

                return response;
            }
            return origFetch.apply(this, args);
        };
        console.log("yttd v2.0.0 ready. Open the YouTube transcript panel (... > Show transcript) to capture.");
    })();

    // ── Helpers ───────────────────────────────────────────────────────────────
    function downloadFile(content, filename) {
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.style.display = "none";
        a.href     = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    }

    function formatTime(sec, useComma) {
        const h  = Math.floor(sec / 3600);
        const m  = Math.floor((sec % 3600) / 60);
        const s  = Math.floor(sec % 60);
        const ms = Math.floor((sec - Math.floor(sec)) * 1000);
        const pad = (n, l) => n.toString().padStart(l, "0");
        return `${pad(h,2)}:${pad(m,2)}:${pad(s,2)}${useComma ? "," : "."}${pad(ms,3)}`;
    }

    function requireCues() {
        if (!capturedCues) {
            console.error("yttd: No transcript captured yet. Open the YouTube transcript panel first (... > Show transcript).");
            return false;
        }
        return true;
    }

    // ── Public API ────────────────────────────────────────────────────────────
    return {
        getVTT: function () {
            if (!requireCues()) return;
            let content = "WEBVTT\n\n";
            capturedCues.forEach(cue => {
                content += `${formatTime(cue.start, false)} --> ${formatTime(cue.end, false)}\n${cue.text}\n\n`;
            });
            downloadFile(content, "transcript.vtt");
            console.log("yttd: WebVTT downloaded.");
        },
        getSRT: function () {
            if (!requireCues()) return;
            let content = "";
            capturedCues.forEach((cue, i) => {
                content += `${i + 1}\n${formatTime(cue.start, true)} --> ${formatTime(cue.end, true)}\n${cue.text}\n\n`;
            });
            downloadFile(content, "transcript.srt");
            console.log("yttd: SRT downloaded.");
        },
        getText: function () {
            if (!requireCues()) return;
            downloadFile(capturedCues.map(c => c.text).join(" "), "transcript.txt");
            console.log("yttd: Text file downloaded.");
        },
        getJSON: function () {
            if (!requireCues()) return;
            downloadFile(JSON.stringify(capturedCues, null, 2), "transcript.json");
            console.log("yttd: JSON downloaded.");
        },
        // Reload transcript if you switched videos without a full page refresh
        reset: function () {
            capturedCues = null;
            console.log("yttd: Cleared. Open the transcript panel again to re-capture.");
        },
        // Quick preview in console
        getPreview: function (n = 5) {
            if (!requireCues()) return;
            console.table(capturedCues.slice(0, n).map(c => ({
                start: formatTime(c.start, false),
                end:   formatTime(c.end, false),
                text:  c.text
            })));
        }
    };
})();
