const startScreen = document.createElement('div')
const title = document.createElement('h1')
const playButton = document.createElement('button')

title.innerHTML = 'Drill Game'
playButton.innerHTML = 'Begin'
playButton.onclick = gameStart

startScreen.appendChild(title)
startScreen.appendChild(playButton)
document.body.appendChild(startScreen)

function gameStart() {
	startScreen.remove()

	const canvas = document.createElement('canvas')
	const ctx = canvas.getContext('2d')

	canvas.width = window.innerWidth
	canvas.height = window.innerHeight 
	
	document.body.appendChild(canvas)

	ctx.translate(10, 10)
	ctx.save()
	const tWidth = window.innerWidth - 50
	const tHeight = window.innerHeight - 50

	ctx.clearRect(0, 0, tWidth, tHeight)
	ctx.fillStyle = 'black'	
	ctx.fillRect(0, 0, tWidth, tHeight)

	let cell = [tWidth / 20, tHeight / 20]

	for (let index = 0; index < 20; index++) {// test ground
		ctx.save()
		ctx.translate(cell[0] * index, tHeight - cell[1])
		ctx.fillStyle = 'red'
		ctx.strokeStyle = 'white'
		ctx.fillRect(0, 0, cell[0], cell[1])
		ctx.strokeRect(0, 0, cell[0], cell[1])
		ctx.restore()		
	}
}