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
let level = []
let player = {
	origin: {},
	size: {x:20, y:20},
	velocity: {x:0, y:0},
	speed: 50,
	vMax: 10,
	move: function() {
		const gravity = 1
		let startingVX

		if ((this.velocity.x > 0 && hor < 0) || (this.velocity.x < 0 && hor > 0)) {
			this.velocity.x = 0
		}
		this.velocity.x = Math.clamp(((this.velocity.x + hor) * delta * this.speed), -this.vMax, this.vMax) 
		this.velocity.y = Math.clamp(((this.velocity.y + ver + gravity) * delta * this.speed), -this.vMax, this.vMax) 
		if (hor === 0 && Math.abs(this.velocity.x) < 0.01) 
			this.velocity.x = 0
			
			//temp collision
			if (this.origin.y + this.size.y + this.velocity.y >= tHeight - cell.y) {
			this.origin.y = (tHeight - cell.y) - this.size.y
			this.velocity.y = Math.min(0, this.velocity.y)
		}

		this.origin.x += this.velocity.x
		this.origin.y += this.velocity.y
		console.log ('input = ', hor)
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
	
	cell = {
		x: tWidth / 20, 
		y: tHeight / 20
	}
	player.origin = {
		x: tWidth / 2, 
		y: tHeight / 2
	}

	

	for (let index = 0; index < 20; index++) {// test ground
		let row = []
		let color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
		for (let index = 0; index < 20; index++) {
			let block = {
				origin: {
					x: cell.x * index, 
					y: tHeight - cell.y
				},
				color: color
			}
			row.push(block)			
		}
		level.push(row)				
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
				iLeft = true				
				break;		
			case 'ArrowRight':
				iRight = true				
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
				iLeft = false
				break;		
			case 'ArrowRight':
				iRight = false
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

function handleInput() {
	if (iLeft) {
		hor = -1
	} else if (iRight) {
		hor = 1
	} else {
		hor = 0
	}

	if (iUp) {
		ver = -3
	} else if (iDown) {
		ver = 1
	} else {
		ver = 0
	}
}

let time = Date.now()
function update() {
	delta = (Date.now() - time) / 1000
	time = Date.now()
	handleInput()
	player.move()
	draw()
	window.requestAnimationFrame(update)
}

function draw() {
	ctx.clearRect(0, 0, tWidth, tHeight)
	ctx.fillStyle = 'black'	
	ctx.fillRect(0, 0, tWidth, tHeight)
	
	ctx.save()
	ctx.translate(player.origin.x, player.origin.y)
	ctx.fillStyle = 'green'
	ctx.fillRect(0, 0, player.size.x, player.size.y)
	ctx.restore()
	level.forEach(row => {
		row.forEach(block => {
			ctx.save()
			ctx.translate(block.origin.x, block.origin.y)
			ctx.fillStyle = block.color
			ctx.strokeStyle = 'blue'
			ctx.fillRect(0, 0, cell.x, cell.y)
			ctx.strokeRect(0, 0, cell.x, cell.y)
			ctx.restore()
		})
	});
}

//utils


Math.clamp = function(number, min, max) {
	return Math.max(min, Math.min(number, max));
}
  
  