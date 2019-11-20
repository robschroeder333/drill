const startScreen = document.createElement('div')
const title = document.createElement('h1')
const playButton = document.createElement('button')

title.innerHTML = 'Drill Game'
playButton.innerHTML = 'Begin'
playButton.onclick = () => console.log('start')

startScreen.appendChild(title)
startScreen.appendChild(playButton)
document.body.appendChild(startScreen)

