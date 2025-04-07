let interactions = [];

function logInteraction(event) {
  const { tagName, className, id } = event.target;
  const interaction = {
    type: event.type,
    tag: tagName,
    class: className || "none",
    id: id || "none",
    timestamp: new Date().toISOString(),
  };
  interactions.push(interaction);
}

document.addEventListener("click", logInteraction);
document.addEventListener("input", logInteraction);

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "startRecording") {
    interactions = [];
  } else if (message.action === "stopRecording") {
    chrome.runtime.sendMessage({
      action: "interactionsCaptured",
      data: interactions,
    });
  }
});