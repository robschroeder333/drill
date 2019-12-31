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
let topLeftBorder
let iLeft
let iRight
let hor
let ver
let iUp
let iDown	
let iFire		

let cell
let levelWidth
let levelHeight

let level = {
	origin: {}, 
	rows: [],
	generate: function() {

		let color
		let layer = 0
		for (let rowI = 0; rowI < levelHeight; rowI++) {
			let row = []

			if (rowI % 10 === 0) {
				color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
				layer++
			}
			for (let blockI = 0; blockI < levelWidth; blockI++) {
				let block = {}
				if (rowI < 10) {
					block = null
				} else {
					let rnd = Math.random() * 100
					if (rnd >= layer * 2 + 10) {
						block =	{
							origin: {
								x: cell.x * blockI, 
								y: cell.y * rowI
							},
							color: color
						}
					} else {
						block = null
					}
				}
	
				row.push(block)			
			}
			level.rows.push(row)				
		}
	}
}

let player = {
	origin: {},
	size: {x:20, y:20},
	velocity: {x:0, y:0},
	speed: 500,
	vMax: 10,
	move: function() {
		const gravity = 1000
		
		this.velocity.x = Math.clamp((this.velocity.x + (hor  * this.speed)) * delta, -this.vMax, this.vMax)
		this.velocity.y = Math.clamp(((this.velocity.y + (ver * this.speed) + gravity) * delta), -this.vMax, this.vMax) 
		
		//adds responsiveness to controls
		if ((this.velocity.x > 0 && hor < 0) || (this.velocity.x < 0 && hor > 0)) {
			this.velocity.x = 0
		}
		if (hor === 0 && Math.abs(this.velocity.x) < 0.01) {
			this.velocity.x = 0
		}
	
		let nextX
		let nextY
		let checkRow
		let checkBlock

		//collision down
		if (this.velocity.y > 0) {
			nextY = this.origin.y + this.size.y + this.velocity.y
			checkRow = Math.floor((nextY - level.origin.y) / cell.y)
			if (checkRow >= 0 && checkRow !== undefined) {
				let left = this.origin.x + this.velocity.x
				let right = this.origin.x + this.size.x + this.velocity.x
				let blockL = level.rows[checkRow][Math.floor((left - level.origin.x) / cell.x)]
				let blockR = level.rows[checkRow][Math.floor((right - level.origin.x) / cell.x)]
				if (blockL) {
					this.origin.y = (blockL.origin.y + level.origin.y) - this.size.y
					this.velocity.y = Math.min(0, this.velocity.y)
				} else if (blockR) {
					this.origin.y = (blockR.origin.y + level.origin.y) - this.size.y
					this.velocity.y = Math.min(0, this.velocity.y)
				}
			}
		//collision up
		} else if (this.velocity.y < 0) {
			nextY = this.origin.y + this.velocity.y
			checkRow = Math.floor((nextY - level.origin.y) / cell.y)
			if (checkRow >= 0 && checkRow !== undefined) {
				let left = this.origin.x + this.velocity.x
				let right = this.origin.x + this.size.x + this.velocity.x
				let blockL = level.rows[checkRow][Math.floor((left - level.origin.x) / cell.x)]
				let blockR = level.rows[checkRow][Math.floor((right - level.origin.x) / cell.x)]
				if (blockL) {
					this.origin.y = blockL.origin.y + cell.y + level.origin.y
					this.velocity.y = Math.max(0, this.velocity.y)
				} else if (blockR) {
					this.origin.y = blockR.origin.y + cell.y + level.origin.y
					this.velocity.y = Math.max(0, this.velocity.y)
				}
			}
		} 
		//collision right
		if (this.velocity.x > 0) {
			nextX = this.origin.x + this.size.x + this.velocity.x
			checkBlock = Math.floor((nextX - level.origin.x) / cell.x)
			if (checkBlock >= 0 && checkBlock !== undefined) {
				let top = this.origin.y + 1
				let bottom = this.origin.y + this.size.y - 1
				let blockTRow = level.rows[Math.floor((top - level.origin.y) / cell.y)]
				let blockT = blockTRow !== undefined ? blockTRow[checkBlock] : null
				let blockBRow = level.rows[Math.floor((bottom - level.origin.y) / cell.y)]
				let blockB = blockBRow !== undefined ? blockBRow[checkBlock] : null
				if (blockT) {
					this.origin.x = (blockT.origin.x + level.origin.x) - this.size.x
					this.velocity.x = Math.min(0, this.velocity.x)
				} else if (blockB) {
					this.origin.x = (blockB.origin.x + level.origin.x) - this.size.x
					this.velocity.x = Math.min(0, this.velocity.x)
				}
			}
		//collision left
		} else if (this.velocity.x < 0) {
			nextX = this.origin.x + this.velocity.x
			checkBlock = Math.floor((nextX - level.origin.x) / cell.x)
			if (checkBlock >= 0 && checkBlock !== undefined) {
				let top = this.origin.y + 1
				let bottom = this.origin.y + this.size.y - 1
				let blockTRow = level.rows[Math.floor((top - level.origin.y) / cell.y)]
				let blockT = blockTRow !== undefined ? blockTRow[checkBlock] : null
				let blockBRow = level.rows[Math.floor((bottom - level.origin.y) / cell.y)]
				let blockB = blockBRow !== undefined ? blockBRow[checkBlock] : null
				if (blockT) {
					this.origin.x = blockT.origin.x + level.origin.x + cell.x
					this.velocity.x = Math.max(0, this.velocity.x)
				} else if (blockB) {
					this.origin.x = blockB.origin.x + level.origin.x + cell.x
					this.velocity.x = Math.max(0, this.velocity.x)
				}
			}
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
	
	//adjust total dimensions for translation offset
	topLeftBorder = 10
	
	ctx.translate(topLeftBorder, topLeftBorder)
	ctx.save()

	tWidth -= topLeftBorder
	tHeight -= topLeftBorder
	
	division = {x: 20, y: 20}
	cell = {
		x: tWidth / division.x, 
		y: tHeight / division.y
	}
	player.origin = {
		x: tWidth / 2, 
		y: cell.y * 5
	}
	levelHeight = 100
	levelWidth = 50

	level.generate()
	level.origin = {
		x: -Math.floor(level.rows[0].length / 2) * cell.x, 
		y: 0
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
	}, false)
					
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
	}, false)
	window.requestAnimationFrame(update)
}


let time = Date.now()
function update() {
	delta = (Date.now() - time) / 1000
	time = Date.now()
	handleInput()
	player.move()
	camera()
	draw()	
	window.requestAnimationFrame(update)
}

function draw() {
	ctx.clearRect(-topLeftBorder, -topLeftBorder, tWidth, tHeight)
	ctx.fillStyle = 'black'	
	ctx.fillRect(0, 0, tWidth, tHeight)
	
	ctx.save()
	ctx.translate(player.origin.x, player.origin.y)
	ctx.fillStyle = 'green'
	ctx.fillRect(0, 0, player.size.x, player.size.y)
	ctx.restore()

	//Draw level with frustum culling
	let topRow = Math.clamp(-Math.ceil(level.origin.y / cell.y), 0, levelHeight)
	let leftCell = Math.clamp(-Math.ceil(level.origin.x / cell.x), 0, levelWidth)
	let bottomRow = Math.clamp(topRow + division.y, 0, levelHeight)
	let rightCell = Math.clamp(leftCell + division.x, 0, levelWidth)
	for (let rowI = topRow; rowI <= bottomRow; rowI++) {
		for (let blockI = leftCell; blockI <= rightCell; blockI++) {
			let block = level.rows[rowI][blockI]
			if (block) {
				ctx.save()
				ctx.translate(block.origin.x + level.origin.x, block.origin.y + level.origin.y)
				ctx.fillStyle = block.color
				ctx.strokeStyle = 'blue'
				ctx.fillRect(0, 0, cell.x, cell.y)
				ctx.strokeRect(0, 0, cell.x, cell.y)
				ctx.restore()
			}	
		}
	}
	ctx.clearRect(-topLeftBorder, -topLeftBorder, topLeftBorder, tHeight + topLeftBorder)
	ctx.clearRect(-topLeftBorder, -topLeftBorder, tWidth + topLeftBorder, topLeftBorder)
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
		ver = 2
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
		player.origin.x = borderFarW
	}
	if (player.origin.y < borderNearH) {
		level.origin.y += borderNearH - player.origin.y
		player.origin.y = borderNearH
	} else if (player.origin.y > borderFarH) {
		level.origin.y -= player.origin.y - borderFarH
		player.origin.y = borderFarH
	}
}

//utils


Math.clamp = function(number, min, max) {
	return Math.max(min, Math.min(number, max));
}
  
  