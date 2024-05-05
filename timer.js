const elTimer = document.querySelector('#elTimer');
const startStopButton = document.querySelector('#startStopButton');
const resetButton = document.querySelector('#resetButton');
const lapButton = document.querySelector('#lapButton');
const timeList = document.getElementById('timeList');
const bestTimeElement = document.querySelector('#resaultBest h4');
const averageTimeElement = document.querySelector('#resaultAverage h4');
const worstTimeElement = document.querySelector('#resaultWorst h4');
const differenceTimeElement = document.querySelector('#resaultDifference h4');

let timerValue = 0.00;
let timerValueStartLap = 0.00;
let intervalId = null;

startStopButton.addEventListener('click', function () {
  if (!lapButton.classList.contains('clicked')) {
    if (startStopButton.textContent === 'Start') {
      startStopButton.textContent = 'Stop';
      intervalId = setInterval(function () {
        timerValue += 0.01;
        updateTimerDisplay(timerValue);
      }, 10);
    } else {
      startStopButton.textContent = 'Start';
      clearInterval(intervalId);
    }
  }
});

function updateTimerDisplay(time) {
  let hours = Math.floor(time / 3600);  // Calculate the hours by dividing the total time by 3600 (number of seconds in an hour) and round down to the nearest whole number
  let minutes = Math.floor((time % 3600) / 60);// Calculate the minutes by finding the remainder of the total time divided by 3600 (to exclude hours) and divide this remainder by number of seconds in a minute
  let seconds = (time % 60).toFixed(2);  // Calculate the seconds by finding the remainder of the total time divided by 60, toFixed(2) is used to keep 2 decimal places for the seconds

  if (hours > 0) {
    // If the timer has been running for more than an hour, format the timer display as 'HH:MM:SS.ss' The padStart function ensures that each component (hours, minutes, seconds) is formatted with leading zeros to maintain a consistent 
    elTimer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(5, '0')}`;
  } else {
    // If the timer has been running for less than an hour, format the timer display as 'MM:SS.ss'
    elTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(5, '0')}`;
  }
}

resetButton.addEventListener('click', function () {
  timerValue = 0.00;
  updateTimerDisplay(timerValue);
  clearInterval(intervalId);
  startStopButton.textContent = 'Start';

  // Check if a lap measurement is in progress and reset the state
  if (lapButton.classList.contains('clicked')) {
    clearInterval(intervalId);
    lapButton.classList.remove('clicked');
    lapButton.textContent = 'Start a lap';
  }
});

lapButton.addEventListener('click', function () {
  // Check if a lap measurement is in progress
  if (lapButton.classList.contains('clicked')) {
    lapButton.textContent = 'Start a lap';
    const lapTime = timerValue - timerValueStartLap; // Correct if lap measurment started while timer was already running 
    const lapTimeFormatted = formatTime(lapTime);
    lapButton.classList.remove('clicked');
    clearInterval(intervalId);
    timerValue = 0.00;
    updateTimerDisplay(timerValue);
    //Download current date and add it with time to timeList 
    const currentDate = new Date();

    const formattedDateTime = currentDate.toLocaleString();
    timeList.innerHTML += '<tr><td>' + lapTimeFormatted + '</td><td>' + formattedDateTime + '</td></tr>';
    // Create array from times stored in timeList and update records
    const times = Array.from(timeList.querySelectorAll('td:first-child'));

    const fastestTime = findFastestTime(times);
    bestTimeElement.textContent = fastestTime;

    const averageTime = findAverageTime(times);
    averageTimeElement.textContent = averageTime;

    const worstTime = findWorstTime(times);
    worstTimeElement.textContent = worstTime;

    const timeDifference = findDifferenceTime(fastestTime, worstTime);
    differenceTimeElement.textContent = timeDifference;

    startStopButton.textContent = 'Start';
  } else {
    lapButton.classList.add('clicked');
    lapButton.textContent = 'Stop a lap';
    startStopButton.textContent = '';  // Erase start/stop textContent from startStopButton
    timerValueStartLap = timerValue;  // Download current time to fix time added to timeList
    clearInterval(intervalId);  // Clear interval if sartStopButton was clicked
    intervalId = setInterval(function () {
      timerValue += 0.01;
      updateTimerDisplay(timerValue);
    }, 10);
  }
});

// Function to format time in seconds to "MM:SS.ss" or "HH:MM:SS.ss" format
function formatTime(timeInSeconds) {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = (timeInSeconds % 60).toFixed(2);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(5, '0')}`;// padStart(2, '0') is used to ensure hours, minutes, and the first two decimal places of seconds are always two digits long, adding a leading zero if necessary
    // padStart(5, '0') is used to ensure the total seconds (including decimal places) are always five digits long, adding leading zeros if necessary
  } else {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(5, '0')}`;
  }
}

function findFastestTime(times) {
  let fastestTime = Infinity;

  times.forEach(function (timeCell) {
    const lapTime = convertTimeToSeconds(timeCell.textContent);

    if (!isNaN(lapTime) && lapTime < fastestTime) {
      fastestTime = lapTime;
    }
  });

  if (isNaN(fastestTime)) {
    return "00:00.00";
  }

  return formatTime(fastestTime);
}

function findAverageTime(times) {
  let sum = 0;
  let count = 0;

  for (const time of times) {
    const lapTime = convertTimeToSeconds(time.textContent);
    if (!isNaN(lapTime)) {
      sum += lapTime;
      count++;
    }
  }

  if (count === 0) {
    return "00:00.00";
  }

  const average = sum / count;
  return formatTime(average);
}

function findWorstTime(times) {
  let worstTime = -Infinity;

  times.forEach(function (timeCell) {
    const lapTime = convertTimeToSeconds(timeCell.textContent);

    if (!isNaN(lapTime) && lapTime > worstTime) {
      worstTime = lapTime;
    }
  });

  if (isNaN(worstTime)) {
    return "00:00.00";
  }

  return formatTime(worstTime);
}

function findDifferenceTime(bestTime, worstTime) {
  const bestTimeSeconds = convertTimeToSeconds(bestTime);
  const worstTimeSeconds = convertTimeToSeconds(worstTime);
  const difference = worstTimeSeconds - bestTimeSeconds;

  return formatTime(difference);
}

function convertTimeToSeconds(time) {
  const timeParts = time.split(':');  // Make array from time
  let hours = 0;
  let minutes = 0;
  let seconds = parseFloat(timeParts[timeParts.length - 1]);  // Get index of seconds

  // Check if the time string includes hours
  if (timeParts.length === 3) {
    // If so, parse the first and second parts of the array as integers to get the hours and minutes
    hours = parseInt(timeParts[0]);
    minutes = parseInt(timeParts[1]);
    // If the time string does not include hours, check if it includes minutes
  } else if (timeParts.length === 2) {
    minutes = parseInt(timeParts[0]);
  }

  // Convert the time to seconds by multiplying hours by 3600 (number of seconds in an hour),
  // minutes by 60 (number of seconds in a minute), and adding the remaining seconds
  // Then return this total number of seconds
  return hours * 3600 + minutes * 60 + seconds;
}