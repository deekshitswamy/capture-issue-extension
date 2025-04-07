let recorder;
let chunks = [];

chrome.action.onClicked.addListener((tab) => {
  chrome.desktopCapture.chooseDesktopMedia(
    ["screen", "window", "tab"],
    (streamId) => {
      if (streamId) {
        navigator.mediaDevices
          .getUserMedia({
            video: {
              mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: streamId,
              },
            },
          })
          .then((stream) => {
            recorder = new MediaRecorder(stream);
            chunks = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => saveRecording();
            recorder.start();
            chrome.runtime.sendMessage({ action: "startRecording" });
          })
          .catch((err) => console.error("Error starting recording:", err));
      }
    }
  );
});

function saveRecording() {
  const blob = new Blob(chunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({
    url: url,
    filename: "recording.webm",
  });
  chrome.runtime.sendMessage({ action: "stopRecording", videoUrl: url });
}

function submitToJira(title, description, videoUrl) {
    const jiraUrl = "https://<your-jira-domain>/rest/api/2/issue";
    const apiToken = "<your-jira-api-token>";
    const email = "<your-jira-email>";
  
    const issueData = {
      fields: {
        project: { key: "<your-project-key>" },
        summary: title,
        description: description,
        issuetype: { name: "Bug" },
      },
    };
  
    fetch(jiraUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${email}:${apiToken}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(issueData),
    })
      .then((response) => response.json())
      .then((data) => {
        const issueId = data.id;
        attachVideoToJira(issueId, videoUrl);
      })
      .catch((err) => console.error("Error creating Jira issue:", err));
  }
  
  function attachVideoToJira(issueId, videoUrl) {
    fetch(videoUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const formData = new FormData();
        formData.append("file", blob, "recording.webm");
  
        fetch(`https://<your-jira-domain>/rest/api/2/issue/${issueId}/attachments`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa("<your-jira-email>:<your-jira-api-token>")}`,
            "X-Atlassian-Token": "no-check",
          },
          body: formData,
        })
          .then(() => console.log("Video attached to Jira issue"))
          .catch((err) => console.error("Error attaching video:", err));
      });
  }
  
  // Call this from popup.js when submitting
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "submitToJira") {
      submitToJira(message.title, message.description, message.videoUrl);
    }
  });