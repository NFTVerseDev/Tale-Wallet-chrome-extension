// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.commands.onCommand.addListener(function(command) {
  console.log('onCommand event received for message: ', command);
});



// function invokeExtension() {
//   // Send a message to the extension
//   chrome.runtime.sendMessage({ greeting: "hello" }, function(response) {
//     console.log(response.farewell);
//   });
// }
// invokeExtension();




// chrome.browserAction.onClicked.addListener(function(tab) {
//     // No tabs or host permissions needed!
//     alert(tab.url);
//     console.log('Turning ' + tab.url + ' red!');
//     chrome.tabs.executeScript({
//         code: 'document.body.style.backgroundColor="red"'
//     });
// });
