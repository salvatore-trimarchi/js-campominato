//###################################################### 
// UI GAME

const mineN       =  3,//16, // number of mines
      level0range = 10,//100, // level 0 steps 
      level1range =  8,//80, // level 1 steps
      level2range =  5;//50; // level 2 steps

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
    console.log('----------------------------------\n'+
                'livello '+usrLevel+', passi '+rangeN);
    levelDisplay('update',usrCount,rangeN,mineN,usrLevel);
    attemptFormDisplay('update',usrCount,rangeN);
    attemptListDisplay('show','');
    // mine field generation
    mineField = mineFieldGen(mineN,rangeN,true);
    console.log('mine field:\n'+mineField);
  } else {
    noticeMsg('level',rangeN,'','');
  }
}
function tryBtnAction() {
  usrTry = parseInt(usrAttemptForm.value);
  if (!isNaN(usrTry) && usrTry >= 1 && usrTry <= rangeN) {
    if (mineField.indexOf(usrTry) != -1) {             // ** BAD STEP **
      usrOut = true;
      noticeMsg('boom','','',usrCount);
      attemptListDisplay('boom',usrCount);
    } else if (usrAttemptList.indexOf(usrTry) == -1) { // ** LUCKY STEP **
      usrAttemptList.push(usrTry);
      console.log('passo '+usrCount+': '+usrAttemptList);
      attemptListDisplay('update',usrCount);
      usrCount++;
      if (usrAttemptList.length==rangeN-mineN) { // ** LUCKY STEP: HAPPY END **
        usrOut = true;
        noticeMsg('alive','','','');
        attemptListDisplay('alive','');
      } else {                                   // ** LUCKY STEP: RE-TRYING **
        levelDisplay('update',usrCount,rangeN,mineN,usrLevel);
        attemptFormDisplay('update',usrCount,rangeN);
      }
    } else {
      noticeMsg('repeated','',usrTry,'');
    }
  } else {
    noticeMsg('wrong',rangeN,'','');
  }
}
function eraseBtnAction() {
  levelDisplay('form','','','','');  
  attemptFormDisplay('hide','','');
  attemptListDisplay('hide','');
}
function resumeBtnAction() {
  if (usrOut) eraseBtnAction();
  noticeMsg('',rangeN,'','');
}

// ** ELEMENTS DISPLAY FUNCTIONS **
function levelDisplay(_mode,_count,_range,_mine,_level) {
  var usrLevelBox     = document.getElementById('usr_level_box');     // class show/hide
  var usrLevelDisplay = document.getElementById('usr_level_display'); // class show/hide
  var usrLevelMsg     = document.getElementById('usr_level_msg');     // innerHtml message
  usrLevelForm.value = '';
  switch (_mode) {
    case 'form': // level form - switch choice
    usrLevelBox.className     = 'show';
    usrLevelDisplay.className = 'hide';
    usrLevelMsg.innerHTML     = '';
    break;
    case 'update': // level form - switch game
      var rem = _range-_mine-_count+1;
      usrLevelBox.className     = 'hide';
      usrLevelDisplay.className = 'show';
      usrLevelMsg.innerHTML     = 
        'Gioca al livello <span class="strong">'+_level+'</span><br>'+
        'Evita '+_mine+' mine, sopravvivi '+rem+' pass'+((rem==1)?'o':'i');
      break;
      default: //
  }
}
function attemptFormDisplay(_mode,_count,_range) {
  var usrAttemptBox   = document.getElementById('usr_attempt_box');   // class show/hide
  var usrAttemptLabel = document.getElementById('usr_attempt_label'); // innerHtml message
  usrAttemptForm.value = '';
  switch (_mode) {
    case 'hide': // attempt form - hide
      usrAttemptBox.className   = 'hide';
      usrAttemptLabel.innerHTML = '';
      usrAttemptForm.placeholder    = '';
      break;
    case 'update': // attempt form - show
      usrAttemptBox.className   = 'show';
      usrAttemptLabel.innerHTML = 'Passo #'+_count;
      usrAttemptForm.placeholder    = 'numero da 1 a '+_range+'';
      break;
    default: //
  }
}
function attemptListDisplay(_mode,_count) {
  var displayResult = document.getElementById('display_result'); // class show/hide
  var resultList    = document.getElementById('result_list');    // innerHtml message
  var buttonBox     = document.getElementById('button_box');     // class show/hide
  switch (_mode) {
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
      resultList.innerHTML += '<tr><td>'+_count+'</td><td>'+usrAttemptList[_count-1]+'</td><tr>';
      break;
    case 'boom':
      resultList.innerHTML += '<tr><td>'+_count+'</td><td class="strong">BOOM!</td><tr>';
      break;
    case 'alive':
      resultList.innerHTML += '<tr><td colspan="2" class="strong">SEI SALVO!</td><tr>';
    break;
    default: //
  }
}

// ** NOTICE MESSAGES **
function noticeMsg(_msg,_range,_try,_count) {
  var msgHtml      = document.getElementById('msg');       // class show/hide
  var checkMsgHtml = document.getElementById('check_msg'); // innerHtml message
  switch (_msg) {
    case 'repeated': // number already tried
      checkMsgHtml.innerHTML = _try+' è già presente, riprova!'; 
      break;
    case 'wrong': // wrong input
      checkMsgHtml.innerHTML = 'Inserisci un numero da 1 a '+_range+'!';
      break;
    case 'level': // no level
      checkMsgHtml.innerHTML = 'Inserisci il livello!';
      break;
    case 'boom': // boom!
      checkMsgHtml.innerHTML = 'Sei finito su una mina al passo <span class="strong">'+_count+'</span>!';
      break;
    case 'alive': // alive!
      checkMsgHtml.innerHTML = '<strong>Sopravvissuto!</strong>';
      break;  
    default: // hide message
      checkMsgHtml.innerHTML = '';
  }
  if (_msg == '') msgHtml.className = 'hide';
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