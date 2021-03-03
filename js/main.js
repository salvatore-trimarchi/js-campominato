//###################################################### 
// UI GAME

const mineN       =  16, // number of mines
      level0range = 100, // level 0 steps 
      level1range =  80, // level 1 steps
      level2range =  50; // level 2 steps

var   rangeN,                       // total steps
      mineField,                    // mine field list
      usrAttemptList = [],          // user attempt list
      usrCount,                     // user attempt counter
      usrOut;                       // user KIA or escaped, true/false

// form sources
var usrLevelForm   = document.getElementById('usr_level');
var usrAttemptForm = document.getElementById('usr_attempt'); // value, placeholder

// ** BUTTON LISTENERS (core interaction) **
document.getElementById('level_btn').addEventListener('click',  levelBtnAction);  // level - game start
document.getElementById('check_btn').addEventListener('click',  tryBtnAction);    // try - game play
document.getElementById('erase_btn').addEventListener('click',  eraseBtnAction);  // erase - game quit
document.getElementById('resume_btn').addEventListener('click', resumeBtnAction); // game resume

// ** BUTTON FUNCTIONS (core dynamics) **
function levelBtnAction() { 
  usrOut = false;
  usrLevel = usrLevelForm.value;
  if (usrLevel != '') {
    rangeN = rangeByLevel(usrLevel);
    usrCount = 1;      
    console.log('livello '+usrLevel+', passi '+rangeN);
    levelDisplay('update',usrCount);
    attemptFormDisplay('update',usrCount);
    attemptListDisplay('show',usrCount);
    // mine field generation
    mineField = mineFieldGen(mineN,rangeN,true);
    console.log('mine field:\n'+mineField);
  } else {
    noticeMsg('level');
  }
}
function tryBtnAction() {
  usrTry = parseInt(usrAttemptForm.value);
  if (!isNaN(usrTry) && usrTry >= 1 && usrTry <= rangeN) {
    if (mineField.indexOf(usrTry) != -1) {             // ** BAD CASE **
      usrOut = true;
      noticeMsg('boom');
      attemptListDisplay('boom',usrCount);
    } else if (usrAttemptList.indexOf(usrTry) == -1) { // ** LUCKY CASE **
      usrAttemptList.push(usrTry);
      console.log('passo '+usrCount+': '+usrAttemptList);
      attemptListDisplay('update',usrCount);
      usrCount++;
      if (rangeN-mineN-usrCount+1==0) {       // ** HAPPY END **
        usrOut = true;
        noticeMsg('alive');
        attemptListDisplay('alive',usrCount);
      } else {                                // ** RE-TRYING **
        levelDisplay('update',usrCount);
        attemptFormDisplay('update',usrCount);
      }
    } else {
      noticeMsg('repeated');
    }
  } else {
    noticeMsg('wrong');
  }
}
function eraseBtnAction() {
  levelDisplay('form',usrCount);  
  attemptFormDisplay('hide',usrCount);
  attemptListDisplay('hide',usrCount);
}
function resumeBtnAction() {
  if (usrOut) eraseBtnAction();
  noticeMsg();
}

// ** ELEMENTS DISPLAY FUNCTIONS **
function levelDisplay(mode,count) {
  var usrLevelBox     = document.getElementById('usr_level_box');     // class show/hide
  var usrLevelDisplay = document.getElementById('usr_level_display'); // class show/hide
  var usrLevelMsg     = document.getElementById('usr_level_msg');     // innerHtml message
  var rem = rangeN-mineN-count+1;
  usrLevelForm.value        = '';
  switch (mode) {
    case 'form': // level form - switch choice
      usrLevelBox.className     = 'show';
      usrLevelDisplay.className = 'hide';
      usrLevelMsg.innerHTML     = '';
      break;
    case 'update': // level form - switch game
      usrLevelBox.className     = 'hide';
      usrLevelDisplay.className = 'show';
      usrLevelMsg.innerHTML     = 
        'Gioca al livello <span class="strong">'+usrLevel+'</span><br>'+
        'Evita '+mineN+' mine, sopravvivi '+rem+' pass'+((rem==1)?'o':'i');
      break;
      default: //
  }
}
function attemptFormDisplay(mode,count) {
  var usrAttemptBox   = document.getElementById('usr_attempt_box');   // class show/hide
  var usrAttemptLabel = document.getElementById('usr_attempt_label'); // innerHtml message
  usrAttemptForm.value = '';
  switch (mode) {
    case 'hide': // attempt form - hide
      usrAttemptBox.className   = 'hide';
      usrAttemptLabel.innerHTML = '';
      usrAttemptForm.placeholder    = '';
      break;
    case 'update': // attempt form - show
      usrAttemptBox.className   = 'show';
      usrAttemptLabel.innerHTML = 'Passo #'+count;
      usrAttemptForm.placeholder    = 'numero da 1 a '+rangeN+'';
      break;
    default: //
  }
}
function attemptListDisplay(mode,count) {
  var displayResult = document.getElementById('display_result'); // class show/hide
  var resultList    = document.getElementById('result_list');    // innerHtml message
  var buttonBox     = document.getElementById('button_box');     // class show/hide
  switch (mode) {
    case 'show': // attempt list - show
      displayResult.className = 'show';
      resultList.innerHTML    = '<tr><td><strong>#</strong></td><td><strong>valore</strong></td><tr>';
      buttonBox.className     = 'show';
      break;
    case 'hide': // attempt list - hide+empty
      displayResult.className = 'hide';
      resultList.innerHTML    = '';
      buttonBox.className     = 'hide';
      usrAttemptList          = [];
      break;
    case 'update': // attempt list - fill
      resultList.innerHTML += '<tr><td>'+count+'</td><td>'+usrAttemptList[count-1]+'</td><tr>';
      break;
    case 'boom':
      resultList.innerHTML += '<tr><td>'+count+'</td><td class="strong">BOOM!</td><tr>';
      break;
    case 'alive':
      resultList.innerHTML += '<tr><td colspan="2" class="strong">SEI SALVO!</td><tr>';
    break;
    default: //
  }
}

// ** NOTICE MESSAGES **
function noticeMsg(w) {
  var msgHtml      = document.getElementById('msg');       // class show/hide
  var checkMsgHtml = document.getElementById('check_msg'); // innerHtml message
  switch (w) {
    case 'repeated': // warning: number already tried
      checkMsgHtml.innerHTML = usrTry+' è già presente, riprova!'; 
      break;
    case 'wrong': // warning: wrong input
      checkMsgHtml.innerHTML = 'Inserisci un numero da 1 a '+rangeN+'!';
      break;
    case 'level': // warning: no level
      checkMsgHtml.innerHTML = 'Inserisci il livello!';
      break;
    case 'boom': // warning: boom!
      checkMsgHtml.innerHTML = 'Sei finito su una mina al passo <span class="strong">'+usrCount+'</span>!';
      break;
    case 'alive': // warninf: alive!
      checkMsgHtml.innerHTML = '<strong>Sopravvissuto!</strong>';
      break;  
    default: // hide warning
      checkMsgHtml.innerHTML = '';
  }
  if (w == null) msgHtml.className = 'hide';
  else {
    msgHtml.className = 'show';
    usrAttemptForm.value = '';
  }
}

// ** GAME FUNCTIONS **
function rangeByLevel(_choice) {
  switch (_choice) {
    case 'difficile':  return level2range;
    case 'intermedio': return level1range;
    default:           return level0range;
  }
}
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
  if (_bolSort) mf.sort(function(a,b) {return a-b;});
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