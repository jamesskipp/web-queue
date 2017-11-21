// You are to simulate a dispatcher using a priority queue system.
//
// New processes are to be entered using a GUI with priority
// included (numbering should be automatic). Processes are also
// to be terminated by GUI command. Context switches are to be by
// command with the cause of the switch being immaterial. Assume
// only one CPU.
//
// Priorities and numbers of processes can be kept small, just
// big enough to demonstrate the below listed functionality.
// ou may pre-populate the queues initially from a data file.
// I am looking at the mechanism as you are NOT creating actual
// processes, just simulating them.
//
// Functionality to be provided by you:
//
// 1. Priority based Ready Queue(s).
// 2. Blocked list.
// 3. Output of complete system status after every context
// switch showing ready, blocked, and running processes.
//
// You are to turn in your source code, an executable, and
// PDF screen shots of the output demonstrating the functionality
// listed above. If you use any data files as initial input,
// provide them also. Compress everything in a zip file and
// submit to the submission link for the Term Project. Python,
// C, C++, and Java are the recommended languages to be used.

const queue = [];
let currentProcess;
let numProcesses = 0;
let gameTime = 0;
const timeLength = 1000;
const timeStep = 1000 / timeLength;

const addJob = (name, time, priority) => {
  if (!name) name = `Process ${numProcesses}`;

  queue.push({
    name,
    time,
    priority,
    timeStarted: gameTime,
    timeRemaining: time,
    index: 0,
  });
  numProcesses += 1;
};

const updateDOM = () => {
  if (currentProcess) {
    $('#current-process').html(`Name: ${currentProcess.name}
      Priority: ${currentProcess.priority} Time Left: ${currentProcess.timeRemaining}`);
  } else {
    $('#current-process').html('CPU IDLE');
  }
  for (let i = 0; i < 10; i += 1) {
    if (queue[i]) {
      $(`#process-${i}`).html(`Name: ${queue[i].name}
        Priority: ${queue[i].priority} Time Left: ${queue[i].timeRemaining}`);
      $(`#process-${i}`).show();
    } else {
      $(`#process-${i}`).html('');
      $(`#process-${i}`).hide();
    }
  }
};

$(document).ready(() => {
  $('#job-btn').click(() => {
    addJob(`Process ${numProcesses}`, 4, 1);
  });
});

// Note to self: There is no way to pause a process ATM.

const runQueue = () => {
  if (currentProcess && currentProcess.timeStarted !== gameTime) {
    currentProcess.timeRemaining -= 1 / timeStep;
    if (currentProcess.timeRemaining === 0) {
      currentProcess = undefined;
    }
  }

  if (queue.length > 0) {
    if (!currentProcess || ((gameTime - currentProcess.timeStarted) % timeStep) === 0) {
      let switched = false;
      let newCurrentProcess;
      queue.forEach((itProcess, index) => {
        if (!currentProcess) {
          currentProcess = { name: 'placeholder' };
          newCurrentProcess = itProcess;
          newCurrentProcess.index = index;
          switched = true;
        } else if (itProcess.priority < currentProcess.priority) {
          newCurrentProcess = itProcess;
          newCurrentProcess.index = index;
          switched = true;
        }
      });
      if (switched) {
        queue.splice(newCurrentProcess.index, 1);
        if (currentProcess.time) queue.push(currentProcess);
        currentProcess = newCurrentProcess;
      }
    }
  }

  updateDOM();

  return setTimeout(() => {
    gameTime += 1;
    if (currentProcess) {
      console.log(`Time: ${gameTime} Size of Queue: ${queue.length} ACTIVE`);
      console.log(currentProcess.name, currentProcess.priority);
    } else {
      console.log(`Time: ${gameTime} Size of Queue: ${queue.length} INACTIVE`);
    }
    runQueue();
  }, timeLength);
};

runQueue();
