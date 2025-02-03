const word = document.getElementById('word');
const text = document.getElementById('text');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const endgameEl = document.getElementById('end-game-container');
const settingsBtn = document.getElementById('settings-btn');
const settings = document.getElementById('settings');
const settingsForm = document.getElementById('settings-form');
const difficultySelect = document.getElementById('difficulty');

const words = ['abandan','apple','abundan'];

let randomWord;
let score = 0;
let time = 10;
let difficulty = localStorage.getItem('difficulty')!== null ? localStorage.getItem('difficulty'):'medium';
difficultySelect.value = difficulty;

text.focus();
const timeInterval = setInterval(updateTime, 1000);

function getRandomWord() {
    return words[Math.floor(Math.random() * words.length)];
}
function addWordToDOM(){
    randomWord = getRandomWord();
    word.innerHTML = randomWord;
}
function updateScore() {
    score++;
    scoreEl.innerHTML = score;
}
function gameOver() {
    endgameEl.innerHTML = `
    <h1>时间结束了</h1>
    <p>你的得分为${score}</p>
    <button onClick = "location.reload()">again再来一次</button>`;
    endgameEl.style.display = 'flex';
}
function updateTime() {
    time--;
    timeEl.innerHTML = time + 's';
    if (time === 0) {
        clearInterval(timeInterval);
        gameOver();
    }
}
addWordToDOM();
text.addEventListener('input',function(e){
    const insertedText = e.target.value;
    if (insertedText === randomWord) {
        addWordToDOM();
        updateScore();
        /*清空输入框*/
        e.target.value = '';
        if(difficulty === 'hard'){
            time +=2;
        }else if(difficulty === 'medium'){
            time +=3;
        }else{
        time += 5;
        }
        updateTime();
    }
})
settingsBtn.addEventListener('click',function () {
    settings.classList.toggle('hide');
})
settingsForm.addEventListener('click',function(e){
    difficulty = e.target.value;
    localStorage.setItem('difficulty',difficulty);
})