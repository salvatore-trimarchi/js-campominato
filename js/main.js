//###################################################### 
// UI GAME

const mineN       =  16, // number of mines
      level0range = 100, // level 0 steps 
      level1range =  80, // level 1 steps
      level2range =  50; // level 2 steps

var   rangeN,                       // total steps
      mineField,                    // mine field list
      usrAttemptN = rangeN - mineN, // user attempt max number
      usrAttemptList = [],          // user attempt list
      usrCount,                     // user attempt counter
      usrKia;                       // user killed in action true/false

// form sources
var usrLevelForm = document.getElementById('usr_level');

// info display hooks
var msgHtml         = document.getElementById('msg');               // class show/hide
var checkMsgHtml    = document.getElementById('check_msg');         // innerHtml message
var buttonBox       = document.getElementById('button_box');        // class show/hide
var displayResult   = document.getElementById('display_result');    // class show/hide
var resultList      = document.getElementById('result_list');       // innerHtml message
var usrAttemptBox   = document.getElementById('usr_attempt_box');   // class show/hide
var usrAttemptLabel = document.getElementById('usr_attempt_label'); // innerHtml message
var usrAttempt      = document.getElementById('usr_attempt');       // value, placeholder
var usrLevelBox     = document.getElementById('usr_level_box');     // class show/hide
var usrLevelDisplay = document.getElementById('usr_level_display'); // class show/hide
var usrLevelMsg     = document.getElementById('usr_level_msg');     // innerHtml message

// ** BUTTON LISTENERS (core functions) **
document.getElementById('level_btn').addEventListener('click',  levelBtnAction);  // level - game start
document.getElementById('check_btn').addEventListener('click',  tryBtnAction);    // try - game play
document.getElementById('erase_btn').addEventListener('click',  eraseBtnAction);  // erase - game quit
document.getElementById('resume_btn').addEventListener('click', resumeBtnAction); // game resume

// BUTTON FUNCTIONS
function levelBtnAction() { 
  usrKia = false;
  usrLevel = usrLevelForm.value;
  if (usrLevel != '') {
    switch (usrLevel) {
      case 'difficile':  rangeN = level2range; break;
      case 'intermedio': rangeN = level1range; break;
      default:           rangeN = level0range;
    }
    usrCount = 1;      
    console.log('livello '+usrLevel+', passi '+rangeN);
    // level form - switch game
    usrLevelBox.className     = 'hide';
    usrLevelDisplay.className = 'show';
    usrLevelMsg.innerHTML     = 'Gioca al livello <span class="strong">'+usrLevel+'</span>';
    // attempt form - show
    usrAttemptLabel.innerHTML = 'Passo #'+usrCount;
    usrAttempt.placeholder    = 'numero da 1 a '+rangeN+'';
    usrAttemptBox.className   = 'show';
    // game buttons
    buttonBox.className       = 'show';
    // attempt list - show
    displayResult.className   = 'show';
    resultList.innerHTML      = '<tr><td><strong>#</strong></td><td><strong>valore</strong></td><tr>';
    // mine field generation
    mineField = mineFieldGen(mineN,rangeN,true);
    console.log('mine field:\n'+mineField);
  } else {
    warning('level'); // warning: no level
  }
}
function tryBtnAction() {
  usrTry = parseInt(usrAttempt.value);
  if (!isNaN(usrTry) && usrTry >= 1 && usrTry <= rangeN) { 
    if (mineField.indexOf(usrTry) != -1) {             // ** BAD CASE **
      usrKia = true;
      // warning
      msgHtml.className      = 'show';
      checkMsgHtml.innerHTML = 'Sei finito su una mina al passo <span class="strong">'+usrCount+'</span>!';
      // attempt list - brutal end
      resultList.innerHTML += '<tr><td>'+usrCount+'</td><td class="strong">BOOM!</td><tr>';
      // attempt form - empty
      usrAttempt.value = '';
    } else if (usrAttemptList.indexOf(usrTry) == -1) { // ** LUCKY CASE **
      usrAttemptList.push(usrTry);
      console.log('passo '+usrCount+': '+usrAttemptList);
      // attempt list - fill
      resultList.innerHTML += '<tr><td>'+usrCount+'</td><td>'+usrAttemptList[usrCount-1]+'</td><tr>';
      // attempt form - update
      usrAttemptLabel.innerHTML = 'Passo #'+usrCount;
      // attempt counter - update
      usrCount++;
      // attempt form - empty
      usrAttempt.value = '';
    } else {
      warning('repeated'); // warning: number already tried
    }
  } else {
    warning('wrong'); // warning: wrong input        
  }
}
function eraseBtnAction() {
  // level form - switch choice
  usrLevelBox.className     = 'show';
  usrLevelDisplay.className = 'hide';
  usrLevelMsg.innerHTML     = '';
  usrLevelForm.value        = '';    
  // attempt form - hide
  usrAttemptBox.className   = 'hide';
  usrAttemptLabel.innerHTML = '';
  usrAttempt.placeholder    = '';
  usrAttempt.value          = '';
  // game buttons
  buttonBox.className       = 'hide';
  // attempt list - hide+empty
  displayResult.className = 'hide';
  resultList.innerHTML    = '';
  usrAttemptList          = [];
}
function resumeBtnAction() {
  if (usrKia) eraseBtnAction();
  warning('hide');
}

// WARNING MESSAGES
function warning(w) {
  switch (w) {
    case 'repeated': // warning: number already tried
      msgHtml.className      = 'show';
      checkMsgHtml.innerHTML = usrTry+' è già presente, riprova!';    
      break;
    case 'wrong': // warning: wrong input
      msgHtml.className      = 'show';
      checkMsgHtml.innerHTML = 'Inserisci un numero da 1 a '+rangeN+'!';
      // attempt form - empty
      usrAttempt.value = '';
      break;
    case 'level': // warning: no level
      msgHtml.className      = 'show';
      checkMsgHtml.innerHTML = 'Inserisci il livello!';
      break;
    case 'hide': // warning: hide
      msgHtml.className      = 'hide';
      checkMsgHtml.innerHTML = '';
      break;
    default: 
      eraseBtnAction();
  }
}

// MINE FIELD GENERATION FUNCTION
/**
 * ritorna array
 * _mineNum numeri diversi tra 1 e _rangeNum
 */ 
function mineFieldGen(_mineNum,_rangeNum,_bolSort) {
  if (_mineNum > _rangeNum) _mineNum = _rangeNum;
  var mf = [];
  while (mf.length<_mineNum) {
    var n = randomNumber(1,_rangeNum);
    if (mf.indexOf(n) == -1) mf.push(n);
  }
  if (_bolSort) mf.sort();
  return mf;
}

function randomNumber(a,b) {
  return Math.floor(Math.random()*(b-a+1)+a);
}

//###################################################### 
// LOGICAL GAME
/*
const mineN = 16; // numero di mine
var   rangeN,     // numero di passi
      level;      // livello

do level = parseInt(prompt('livello 0, 1, 2'));
while (isNaN(level) || level < 0 || level > 2);

switch (level) {
  case 2:  rangeN =  50; break;
  case 1:  rangeN =  80; break;
  default: rangeN = 100;
}
console.log('livello '+level+', passi '+rangeN);

var usrAttemptN = rangeN - mineN, // numero massimo di tentativi utente
    usrAttemptList = [];          // elenco di tentativi utente

var mineField = mineFieldGen(mineN,rangeN,false);
console.log('mine field:\n'+mineField);

var counter = 1, usrKia = false;
while (usrAttemptList.length < usrAttemptN && !usrKia) { 

  // usr data retrieving
  var usrTry;
  do usrTry = parseInt(prompt('tentativo '+counter+' (numero da 1 a '+rangeN+')'));
  while (isNaN(usrTry) || usrTry < 1 || usrTry > rangeN);

  if (mineField.indexOf(usrTry) != -1) {
    // bad case
    usrKia = true;
    alert('sei finito su una mina al passo '+counter+'!');
  } else if (usrAttemptList.indexOf(usrTry) == -1) {
    // lucky case
    usrAttemptList.push(usrTry);
    console.log('passo '+counter+': '+usrAttemptList);
    counter++;
  } else {
    alert('già presente, riprova');
  }
}

if (!usrKia) {
  alert('sei sopravvissuto fino alla fine! ('+usrAttemptN+'passi)');
} 
*/

//###################################################### 
//