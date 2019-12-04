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
let level = {
	origin: {}, 
	rows: []
}
let player = {
	origin: {},
	size: {x:20, y:20},
	velocity: {x:0, y:0},
	speed: 50,
	vMax: 10,
	move: function() {
		const gravity = 1

		//adds responsiveness to controls
		if ((this.velocity.x > 0 && hor < 0) || (this.velocity.x < 0 && hor > 0)) {
			this.velocity.x = 0
		}

		this.velocity.x = Math.clamp(((this.velocity.x + hor) * delta * this.speed), -this.vMax, this.vMax) 
		this.velocity.y = Math.clamp(((this.velocity.y + ver + gravity) * delta * this.speed), -this.vMax, this.vMax) 
		
		if (hor === 0 && Math.abs(this.velocity.x) < 0.01) 
			this.velocity.x = 0
		
		//vertical collision (down)
		let nextY = this.origin.y + this.size.y + this.velocity.y
		let checkRow = -1
		level.rows.forEach((ele, i) => {
			if (nextY >= i * cell.y + level.origin.y && nextY < (i + 1) * cell.y + level.origin.y) 
				checkRow = i
		});

		if (checkRow != -1) {
			level.rows[checkRow].forEach(ele => {
				if (((this.origin.x >= ele.origin.x + level.origin.x) && (this.origin.x < ele.origin.x + level.origin.x + cell.x)) 
					|| ((this.origin.x + this.size.x >= ele.origin.x + level.origin.x) && (this.origin.x + this.size.x < ele.origin.x + level.origin.x + cell.x))){
					this.origin.y = (ele.origin.y + level.origin.y) - this.size.y
					this.velocity.y = Math.min(0, this.velocity.y)
				}
			})
		}

		this.origin.x += this.velocity.x
		this.origin.y += this.velocity.y
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

	level.origin = {x: -50, y: tHeight}
	

	for (let rowI = 0; rowI < 20; rowI++) {// test ground
		let row = []
		let color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
		for (let blockI = 0; blockI < 40; blockI++) {
			let block = {
				origin: {
					x: cell.x * blockI, 
					y: cell.y * rowI
				},
				color: color
			}
			row.push(block)			
		}
		level.rows.push(row)				
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
	update()
}


let time = Date.now()
function update() {
	setInterval(() => {
		delta = (Date.now() - time) / 1000
		time = Date.now()
		handleInput()
		player.move()
		camera()
		draw()		
	}, 1000/30);
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
	level.rows.forEach(row => {
		row.forEach(block => {
			ctx.save()
			ctx.translate(block.origin.x + level.origin.x, block.origin.y + level.origin.y)
			ctx.fillStyle = block.color
			ctx.strokeStyle = 'blue'
			ctx.fillRect(0, 0, cell.x, cell.y)
			ctx.strokeRect(0, 0, cell.x, cell.y)
			ctx.restore()
		})
	});
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

function camera() {
	const borderNearW = cell.x * 3
	const borderNearH = cell.y * 7
	const borderFarW = tWidth - borderNearW
	const borderFarH = tHeight - borderNearH
	if (player.origin.x < borderNearW) {
		level.origin.x += borderNearW - player.origin.x
		player.origin.x = borderNearW
	} else if (player.origin.x > borderFarW) {
		level.origin.x -= player.origin.x - borderFarW
		player.origin.x =  borderFarW
	}
	if (player.origin.y < borderNearH) {
		level.origin.y += borderNearH - player.origin.y
		player.origin.y = borderNearH
	} else if (player.origin.y > borderFarH) {
		level.origin.y -= player.origin.y - borderFarH
		player.origin.y =  borderFarH
	}
}

//utils


Math.clamp = function(number, min, max) {
	return Math.max(min, Math.min(number, max));
}
  
  