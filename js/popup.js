let videoUrl = null;
let steps = [];

document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({ action: "checkRecording" });
});

document.getElementById("stopBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "stopRecording" });
});

document.getElementById("submitBtn").addEventListener("click", () => {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  if (!title || !description) {
    alert("Please fill in the title and ensure steps are generated.");
    return;
  }
  chrome.runtime.sendMessage({
    action: "submitToJira",
    title,
    description,
    videoUrl,
  });
  alert("Submitted to Jira!");
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "startRecording") {
    document.getElementById("stopBtn").disabled = false;
    document.getElementById("submitBtn").disabled = true;
  } else if (message.action === "stopRecording") {
    videoUrl = message.videoUrl;
    document.getElementById("stopBtn").disabled = true;
    document.getElementById("submitBtn").disabled = false;
  } else if (message.action === "interactionsCaptured") {
    steps = message.data.map((i) =>
      `${i.type} on ${i.tag} (class: ${i.class}, id: ${i.id}) at ${i.timestamp}`
    );
    document.getElementById("description").value = "Steps to Reproduce:\n" + steps.join("\n");
  }
});