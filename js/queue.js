let readyQueue = [];
let blockedList = [];
let currentProcess;
let numProcesses = 0;
const startTime = new Date().valueOf();

// For adding processes via the add process button
const addProcess = (name, length, priority) => {
  if (!name) name = `Process ${numProcesses}`;

  readyQueue.push({
    name,
    length,
    priority,
    timeStarted: new Date().valueOf() - startTime,
    timeRemaining: length,
    index: 0,
  });
  numProcesses += 1;
};

// Updates the DOM - both process lists and the CPU
const updateDOM = () => {
  // Update the current process
  if (currentProcess) {
    $('#current-process')
      .html(`${currentProcess.name}: Priority: ${currentProcess.priority} Arrived: ${(currentProcess.timeStarted / 1000).toFixed(1)}`)
      .removeClass('cpu-idle')
      .addClass('cpu-active');
  } else {
    $('#current-process')
      .html('CPU IDLE')
      .removeClass('cpu-active')
      .addClass('cpu-idle');
  }
  // Update the list of ready processes
  for (let i = 0; i < 10; i += 1) {
    if (readyQueue[i]) {
      $(`#process-${i}`)
        .html(`${readyQueue[i].name}: Priority: ${readyQueue[i].priority} Arrived: ${(readyQueue[i].timeStarted / 1000).toFixed(1)}`)
        .show();
    } else {
      $(`#process-${i}`)
        .html('')
        .hide();
    }
  }
  // Update the list of blocked processes
  for (let i = 0; i < 10; i += 1) {
    if (blockedList[i]) {
      $(`#block-${i}`)
        .html(`${blockedList[i].name}: Priority: ${blockedList[i].priority} Arrived: ${(blockedList[i].timeStarted / 1000).toFixed(1)}`)
        .show();
    } else {
      $(`#block-${i}`)
        .html('')
        .hide();
    }
  }
};

// Sort the ready queue by priority first and then time started
const sortReadyQueue = () => {
  readyQueue = _.sortBy(readyQueue, ['priority', 'timeStarted']);
  readyQueue = readyQueue.filter(itProcess => itProcess !== undefined && itProcess !== null);
};

// Sort the blocked list by priority first and then time started
const sortBlockedList = () => {
  blockedList = _.sortBy(blockedList, ['priority', 'timeStarted']);
  blockedList = blockedList.filter(itProcess => itProcess !== undefined && itProcess !== null);
};

// Print the status of the ready queue, the blocked list, and the cpu
const printStatus = (message) => {
  const div = $('<div></div>');
  const switchHeader = $('<h3></h3>');
  const readyHeader = $('<h4></h4>');
  const blockedHeader = $('<h4></h4>');
  const cpuHeader = $('<h4></h4>');
  const readyP = $('<p></p>');
  const blockedP = $('<p></p>');

  // Sort to make sure everything is in the right place.
  sortReadyQueue();
  sortBlockedList();

  // header of the switch
  switchHeader.text(`Context Switch - ${message}`);

  // Variable for storing content about the CPU

  // Add the currently running process
  if (currentProcess) cpuHeader.text(`Currently Running Process: ${currentProcess.name}`);
  else cpuHeader.text('CPU Idle');

  // Variable for storing the ready queue content
  let readyContent = '';

  // Add the contents of the ready queue
  if (readyQueue.length >= 1) {
    readyHeader.text(`${readyQueue.length} Process(es) in the Ready Queue: `);
    for (let i = 0; i < readyQueue.length; i += 1) {
      readyContent += `${readyQueue[i].name} - Priority ${readyQueue[i].priority}, Created At ${(readyQueue[i].timeStarted / 1000).toFixed(1)} | `;
    }
  } else {
    readyHeader.text('The Ready Queue is Empty');
  }

  // Variable for storing the blocked list content
  let blockedContent = '';

  // Add the contents of the blocked list
  if (blockedList.length >= 1) {
    blockedHeader.text(`${blockedList.length} Process(es) in the Blocked List: `);
    for (let i = 0; i < blockedList.length; i += 1) {
      blockedContent += `${blockedList[i].name} - Priority ${blockedList[i].priority}, Created At ${(blockedList[i].timeStarted / 1000).toFixed(1)} | `;
    }
  } else {
    blockedHeader.text('The Blocked List is Empty');
  }

  // Add the text to paragraph tags
  readyP.text(readyContent);
  blockedP.text(blockedContent);

  // Append the heading and paragraphs for each switch
  div.append(switchHeader);
  div.append(cpuHeader);
  div.append(readyHeader);
  div.append(readyP);
  div.append(blockedHeader);
  div.append(blockedP);

  div.addClass('context-content');

  // Append the switch to the list of switches
  $('#context-list').append(div)
    .append('<hr/>');
};

// The main algorithm for switching the current process.
const update = (switchedProcess) => {
  // These function calls ensure that the highest priority process is in the [0]th element in
  // ready queue and blocked list. Also removes empty array entries and condenses.
  sortReadyQueue();
  sortBlockedList();

  // The main algorithm assumes that the [0]th element in both the ready queue and the blocked list
  // is the highest priority process.
  if (readyQueue.length >= 1) {
    const savedProcess = currentProcess;
    // If there is no current process
    if (!currentProcess) {
      currentProcess = readyQueue[0];
      readyQueue[0] = null;
    // If there is a process waiting with a higher priority.
    } else if (currentProcess.priority > readyQueue[0].priority) {
      readyQueue.push(currentProcess);
      currentProcess = readyQueue[0];
      readyQueue[0] = null;
      printStatus(`The CPU switched out ${savedProcess.name} for ${currentProcess.name} (priority).`);
    // If there is a process with the same priority, but it has been waiting longer.
    } else if (currentProcess.priority === readyQueue[0].priority && currentProcess.timeStarted > readyQueue[0].timeStarted) {
      readyQueue.push(currentProcess);
      currentProcess = readyQueue[0];
      readyQueue[0] = null;
      printStatus(`The CPU switched out ${savedProcess.name} for ${currentProcess.name} (time waited)`);
    }
  }

  // If the context switch happened outside of this function
  if (switchedProcess) {
    printStatus(`The CPU switched out ${switchedProcess.name} because it was blocked.`);
  }

  // Sort the lists again after the changes.
  sortReadyQueue();
  sortBlockedList();

  // Update the DOM to reflect all changes.
  updateDOM();
};

// Button clicks and default values set here.
$(document).ready(() => {
  // Set default values
  $('#name').val(`Process ${numProcesses + 1}`);
  $('#priority').val('5');

  // Button to add a process
  $('#add-btn').click(() => {
    let name = '';

    if ($('#name').val().includes('<')) name = `Process ${numProcesses + 1}`;
    else name = $('#name').val();

    addProcess(name, $('#length').val(), $('#priority').val());
    $('#name').val(`Process ${numProcesses + 1}`);

    // Update - contextSwitch = false b/c button didn't affect currentProcess
    update(false);
  });

  // Button to finish executing the current process
  $('#end-btn').click(() => {
    currentProcess = null;

    // Update - contextSwitch = false b/c button didn't affect currentProcess
    update(false);
  });

  // Button to block the currently running process
  $('#block-btn').click(() => {
    if (currentProcess) {
      const saveProcess = currentProcess;
      blockedList.push(currentProcess);
      currentProcess = null;

      // Update - contextSwitch = false because the
      update(saveProcess);
    }
  });

  // Button to unblock the highest priority blocked process
  $('#unblock-btn').click(() => {
    if (blockedList.length >= 1) {
      readyQueue.push(blockedList[0]);
      blockedList[0] = null;

      // Update - contextSwitch = false b/c button didn't affect currentProcess
      update(false);
    }
  });
});
