const startScreen = document.createElement('div')
const title = document.createElement('h1')
const playButton = document.createElement('button')
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

title.innerHTML = 'Drill Game'
playButton.innerHTML = 'Begin'
playButton.onclick = gameStart

startScreen.appendChild(title)
startScreen.appendChild(playButton)
document.body.appendChild(startScreen)

let delta

let tWidth
let tHeight
let iLeft
let iRight
let hor
let ver
let iUp
let iDown	
let iFire		

let cell
let level
let player = {
	origin: [],
	size: [20, 20],
	velocity: [0, 0],
	speed: 50,
	vMax: 10,
	move: function() {
		this.velocity[0] = Math.clamp((this.velocity[0] + hor) * delta * this.speed, -this.vMax, this.vMax) 
		if (hor === 0 && Math.abs(this.velocity[0]) < 0.01) this.velocity[0] = 0
		
		if (iUp) this.origin[1] -= 1
		if (iDown) this.origin[1] += 1
		this.origin[0] += this.velocity[0]
		//this.origin[0] += 1 //gravity

	}
}

function gameStart() {
	startScreen.remove()
	document.body.appendChild(canvas)

	hor = 0
	ver = 0
	delta = 0

	//total dimensions for canvas with offset for border
	tWidth = window.innerWidth - 25
	tHeight = window.innerHeight - 25
	canvas.width = tWidth
	canvas.height = tHeight
	
	ctx.translate(10, 10)
	ctx.save()

	//adjust total dimensions for translation offset
	tWidth -= 10
	tHeight -= 10
	
	cell = [tWidth / 20, tHeight / 20]
	player.origin = [tWidth / 2, tHeight / 2]

	

	for (let index = 0; index < 20; index++) {// test ground
		ctx.save()
		ctx.translate(cell[0] * index, tHeight - cell[1])
		ctx.fillStyle = 'red'
		ctx.strokeStyle = 'blue'
		ctx.fillRect(0, 0, cell[0], cell[1])
		ctx.strokeRect(0, 0, cell[0], cell[1])
		ctx.restore()		
	}

	//player
	iLeft = false
	iRight = false
	iUp = false
	iDown = false	
	iFire = false

	document.addEventListener('keydown', (event) => {
		switch (event.code) {
			case 'Space':
				iFire = true
				break;
			case 'ArrowLeft':
				hor = -1
				break;		
			case 'ArrowRight':
				hor = 1
				break;		
			case 'ArrowUp':
				iUp = true
				break;		
			case 'ArrowDown':
				iDown = true
				break;		
		}
	})

	document.addEventListener('keyup', (event) => {
		switch (event.code) {
			case 'Space':
				iFire = false
				break;
			case 'ArrowLeft':
				hor = 0
				break;		
			case 'ArrowRight':
				hor = 0
				break;		
			case 'ArrowUp':
				iUp = false
				break;		
			case 'ArrowDown':
				iDown = false
				break;		
		}
	})
	window.requestAnimationFrame(update)
}


let time = Date.now()
function update() {
	delta = (Date.now() - time) / 1000
	time = Date.now()
	player.move()

	ctx.clearRect(0, 0, tWidth, tHeight)
	ctx.fillStyle = 'black'	
	ctx.fillRect(0, 0, tWidth, tHeight)

	ctx.save()
	ctx.translate(player.origin[0], player.origin[1])
	ctx.fillStyle = 'green'
	ctx.fillRect(0, 0, player.size[0], player.size[1])
	ctx.restore()
	window.requestAnimationFrame(update)
}

//utils


Math.clamp = function(number, min, max) {
	return Math.max(min, Math.min(number, max));
}
  
  