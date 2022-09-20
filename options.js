// Saves options to chrome.storage
function save_options() {
  var refreshInterval = Number(document.getElementById('refreshInterval').value);
  var refreshIntervalActive = document.getElementById('refreshIntervalActive').checked;
  var autoKudosActive = document.getElementById('autoKudos').checked;

  chrome.storage.sync.set({
    refreshInterval: refreshInterval,
    refreshIntervalActive: refreshIntervalActive,
    autoKudosActive: autoKudosActive
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    refreshInterval: '60',
    refreshIntervalActive: false,
    autoKudosActive: false
  }, function(items) {
    document.getElementById('refreshInterval').value = items.refreshInterval;
    document.getElementById('refreshIntervalActive').checked = items.refreshIntervalActive;
    document.getElementById('autoKudos').checked = items.autoKudosActive;

});
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',save_options);