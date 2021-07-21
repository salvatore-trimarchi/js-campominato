//###################################################### 
// GAME + 2D UI + 1D UI

const mineN = 16, // number of mines
      rowN0 = 10, colN0 = 10, // 100 = 10 * 10 level 0 cells 
      rowN1 =  9, colN1 =  9, //  81 =  9 *  9 level 1 cells
      rowN2 =  7, colN2 =  7; //  49 =  7 *  7 level 2 cells

var level0range = rowN0*colN0, // 100 level 0 steps 
    level1range = rowN1*colN1, //  81 level 1 steps
    level2range = rowN2*colN2; //  49 level 2 steps

var   rangeN,              // total steps
      mineField,           // mine field list, array
      usrAttemptList = [], // user attempt list, array
      usrCount,            // user attempt counter
      usrOut;              // user KIA or escaped, bool

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
  document.getElementById('grid').style.animation = '';
  usrOut = false;
  usrLevel = usrLevelForm.value;
  if (usrLevel != '') {
    // level settings
    rangeN = rangeByLevel(usrLevel);
    usrCount = 1;      
    console.log('----------------------------------\n'+
                'livello '+usrLevel+', passi '+rangeN);
    levelDisplay('update',usrCount,rangeN,mineN,usrLevel);
    attemptFormDisplay('update',usrCount,rangeN);
    attemptListDisplay('show','');
    // mine field generation
    mineField = mineFieldGen(mineN,rangeN);
    // mine field grid deploy & show
    mineGridDeploy(mineField,rangeN,'grid',false);
    elDisplay('grid_box','show');
    console.log('mine field:\n'+mineField);
  } else {
    // no level defined
    noticeMsg('nolevel',rangeN,'','');
  }
}
function tryBtnAction(_cell) {
  var usrTry;
  if (isNaN(_cell)) {
    usrTry = parseInt(usrAttemptForm.value);
  } else {
    usrTry = parseInt(_cell);
    resumeBtnAction();
  }
  if (!isNaN(usrTry) && usrTry >= 1 && usrTry <= rangeN) {
    if (mineField.indexOf(usrTry) != -1) {             // ** BAD STEP **
      usrOut = true;
      noticeMsg('boom','','',usrCount);
      attemptListDisplay('boom',usrCount);
      mineGridShowMines(mineField,rangeN,true);
    } else if (usrAttemptList.indexOf(usrTry) == -1) { // ** LUCKY STEP **
      usrAttemptList.push(usrTry);
      console.log('passo '+usrCount+': '+usrAttemptList);
      attemptListDisplay('update',usrCount);
      mineGridPassedCell(usrTry,rangeN);
      usrCount++;
      if (usrAttemptList.length==rangeN-mineN) { // ** LUCKY STEP: HAPPY END **
        usrOut = true;
        noticeMsg('alive','','','');
        attemptListDisplay('alive','');
        mineGridShowMines(mineField,rangeN,false);
      } else {                                   // ** LUCKY STEP: RE-TRYING **
        levelDisplay('update',usrCount,rangeN,mineN,usrLevel);
        attemptFormDisplay('update',usrCount,rangeN);
      }
    } else {
      // number already tried
      noticeMsg('repeated','',usrTry,'');
    }
  } else {
    // wrong input
    noticeMsg('wrong',rangeN,'','');
  }
}
function eraseBtnAction() {
  levelDisplay('form','','','','');
  attemptFormDisplay('hide','','');
  attemptListDisplay('hide','');
  elDisplay('grid_box','hide');
}
function resumeBtnAction() {
  if (usrOut) eraseBtnAction();
  noticeMsg('',rangeN,'','');
}

// ** ELEMENTS DISPLAY FUNCTIONS **
function elDisplay(_el,_mode) {
  var el = document.getElementById(_el);
  switch (_mode) {
    case 'show': el.className = 'show'; break;
    case 'hide': el.className = 'hide'; break;
    default: //
  }
}
function levelDisplay(_mode,_count,_range,_mine,_level) {
  var usrLevelBox     = document.getElementById('usr_level_box');
  var usrLevelDisplay = document.getElementById('usr_level_display');
  var usrLevelMsg     = document.getElementById('usr_level_msg');
  usrLevelForm.value = '';
  switch (_mode) {
    case 'form':
    usrLevelBox.className     = 'show';
    usrLevelDisplay.className = 'hide';
    usrLevelMsg.innerHTML     = '';
    break;
    case 'update':
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
  var usrAttemptBox   = document.getElementById('usr_attempt_box');
  var usrAttemptLabel = document.getElementById('usr_attempt_label');
  usrAttemptForm.value = '';
  switch (_mode) {
    case 'hide':
      usrAttemptBox.className   = 'hide';
      usrAttemptLabel.innerHTML = '';
      usrAttemptForm.placeholder    = '';
      break;
    case 'update':
      usrAttemptBox.className   = 'show';
      usrAttemptLabel.innerHTML = 'Passo #'+_count;
      usrAttemptForm.placeholder    = 'numero da 1 a '+_range+'';
      break;
    default: //
  }
}
function attemptListDisplay(_mode,_count) {
  var displayResult = document.getElementById('display_result');
  var resultList    = document.getElementById('result_list');
  var buttonBox     = document.getElementById('button_box');
  switch (_mode) {
    case 'show':
      displayResult.className = 'show';
      buttonBox.className     = 'show';
      break;
    case 'hide':
      displayResult.className = 'hide';
      resultList.innerHTML    = '';
      buttonBox.className     = 'hide';
      usrAttemptList          = [];
      break;
    case 'update':
      resultList.innerHTML = '<tr><td>'+_count+'</td><td>'+usrAttemptList[_count-1]+'</td><tr>' + resultList.innerHTML;
      break;
    case 'boom': 
      resultList.innerHTML = '<tr><td>'+_count+'</td><td class="strong">BOOM!</td><tr>' + resultList.innerHTML;
      break;
    case 'alive':
      resultList.innerHTML = '<tr><td colspan="2"><strong>SEI SALVO!</strong></td><tr>' + resultList.innerHTML;
    break;
    default: //
  }
}

// ** NOTICE MESSAGES **
function noticeMsg(_msg,_range,_try,_count) {
  var msgHtml      = document.getElementById('msg');
  var checkMsgHtml = document.getElementById('check_msg');
  switch (_msg) {
    case 'repeated': // number already tried
      checkMsgHtml.innerHTML = _try+' è già presente, riprova!'; 
      break;
    case 'wrong': // wrong input
      checkMsgHtml.innerHTML = 'Inserisci un numero da 1 a '+_range+'!';
      break;
    case 'nolevel': // no level defined
      checkMsgHtml.innerHTML = 'Inserisci il livello!';
      break;
    case 'boom':
      checkMsgHtml.innerHTML = 'Sei finito su una mina al passo <span class="strong">'+_count+'</span>!';
      break;
    case 'alive':
      checkMsgHtml.innerHTML = '<strong class="strong">Sopravvissuto!</strong>';
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

// ** GRID FUNCTIONS **
function mineFieldGen(_mineNum,_rangeNum) {
  if (_mineNum > _rangeNum) _mineNum = _rangeNum;
  var mf = [];
  while (mf.length<_mineNum) {
    var n = randomNumber(1,_rangeNum);
    if (mf.indexOf(n) == -1) mf.push(n);
  }
  mf.sort(function(a,b) {return a-b;});
  return mf;
}
function mineGridDeploy(_mineField,_rangeN,_elID,_bol) {
  var row = gridByRange(_rangeN)[0];
  var col = gridByRange(_rangeN)[1];
  var el = document.getElementById(_elID);
  var cell = 1, html = '';
  while (cell<=(row*col)) {
    for (var i=1; i<=row; i++) {
      html += '<tr>';
      for (var j=1; j<=col; j++) {
        var classMine;
        if (_bol) { 
          classMine = (_mineField.indexOf(cell) != -1) ? 'class="mine"' : 'class="safe"';
          cellView  = (_mineField.indexOf(cell) != -1) ? '<i class="fas fa-bomb"></i>' : cell; 
        } else { 
          classMine = '';
          cellView = cell;
        } 
        var onclickCell = 'onclick="mineGridClick(\''+cell+'\')"';
        html += '<td id="'+cell+'" '+classMine+' '+onclickCell+'>'+cellView+'</td>';
        cell++;
      }
      html += '</tr>';
    }
  }
  el.innerHTML = html;
}
function mineGridClick(_cell) {
  if (!usrOut) tryBtnAction(_cell);
}
function mineGridPassedCell(_cell,_range) {
  document.getElementById(_cell).className = 'passed';
  mineGridNeighborsHint(_cell,_range);
}
function mineGridNeighborsHint(_cell,_range) {
  var c = gridByRange(_range)[1], count = 0;
  var n = [_cell-c-1,_cell-c,_cell-c+1,_cell-1,_cell+1,_cell+c-1,_cell+c,_cell+c+1];
  for (var i=0; i<n.length; i++) {
    count += (mineField.indexOf(n[i]) != -1) ? 1 : 0;
  }
  console.log('bad neighbors: '+count);
  document.getElementById(_cell).innerHTML = count;
}
function mineGridShowMines(_mineField,_rangeN,_bol) {
  mineGridDeploy(_mineField,_rangeN,'grid',true);
  if (_bol) mineGridDramaAnimation();
  else mineGridQuietAnimation();
}
function mineGridDramaAnimation() {
  document.getElementById('grid').style.animation = 'drama1 0.6s ease-in-out 0.2s both';
  var mine = document.getElementsByClassName('mine');
  for (var i=0; i<mine.length; i++) mine[i].style.animation = 'drama2 0.8s ease-in both';
}
function mineGridQuietAnimation() {
  var safe = document.getElementsByClassName('safe');
  var mine = document.getElementsByClassName('mine');
  for (var i=0; i<safe.length; i++) safe[i].style.animation = 'quiet1 1s linear';
  for (var i=0; i<mine.length; i++) mine[i].style.animation = 'quiet2 2s linear 0.2s';
}
function rangeByLevel(_choice) {
  switch (_choice) {
    case 'difficile':  return level2range;
    case 'intermedio': return level1range;
    default:           return level0range;
  }
}
function gridByRange(_range) {
  switch (_range) {
    case level2range: return [rowN2,colN2];
    case level1range: return [rowN1,colN1];
    default:          return [rowN0,colN0];
  }
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

var mineField = mineFieldGen(mineN,rangeN);
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