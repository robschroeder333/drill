const startScreen = document.createElement('div')
const title = document.createElement('h1')
const playButton = document.createElement('button')
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

title.innerHTML = 'Drill Game'
title.style.color = 'grey'
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
let iUp
let iDown	
let hor
let ver
let iFire	
let iJump	

let cell
let levelWidth
let levelHeight

//Game Logic
////////////
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
	iJump = false
	
	player.origin = {
		x: tWidth / 2, 
		y: cell.y * 3
	}
	player.bullets = new Collection()
	player.lastShot = Date.now()

	enemies = new Collection()
	enemies.add(new Shooter({x: 400, y: 200}, {x: 15, y: 10}, 1)) //test enemy

	document.addEventListener('keydown', (event) => {
		switch (event.code) {
			case 'KeyC':
				iFire = true
				break;
			case 'KeyX':
				iJump = true
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
			case 'KeyC':
				iFire = false
				break;
			case 'KeyX':
				iJump = false
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

	//Begin Game
	window.requestAnimationFrame(update)
}


let time = Date.now()
function update() {
	delta = (Date.now() - time) / 1000
	time = Date.now()
	if (player.health <= 0) {
		console.log('You have died')
		player.color = 'red'
	}
	handleInput()
	player.move()	
	player.bullets.checkAll()

	enemies.checkAll()

	camera()
	draw()	
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

	if (iJump) {
		ver = -3
	} else if (iDown) {
		ver = 2
	} else {
		ver = 0
	}

	if (iFire && canFire(player)) {
		player.fire()
	}
}

function draw() {
	ctx.clearRect(-topLeftBorder, -topLeftBorder, tWidth, tHeight)
	
	//Draw background
	ctx.fillStyle = 'black'	
	ctx.fillRect(0, 0, tWidth, tHeight)
	
	//Draw player
	ctx.save()
	ctx.translate(player.origin.x, player.origin.y)
	ctx.fillStyle = player.color
	ctx.fillRect(0, 0, player.size.x, player.size.y)
	ctx.restore()

	//Draw player's bullets
	player.bullets.drawAll()

	
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
	enemies.drawAll()
	ctx.clearRect(-topLeftBorder, -topLeftBorder, topLeftBorder, tHeight + topLeftBorder)
	ctx.clearRect(-topLeftBorder, -topLeftBorder, tWidth + topLeftBorder, topLeftBorder)
}

function camera() {
	const borderNearW = cell.x * 3
	const borderNearH = cell.y * 7
	const borderFarW = tWidth - borderNearW
	const borderFarH = tHeight - borderNearH	

	//horizontal
	if (player.origin.x < borderNearW) {
		//prevent camera from seeing past left edge of level
		if (borderNearW - player.origin.x + level.origin.x < 0) {
			//move level right and keep player in place
			level.origin.x += borderNearW - player.origin.x
			player.origin.x = borderNearW
		}
		
	} else if (player.origin.x > borderFarW) {
		//prevent camera from seeing past right edge of level
		if (level.origin.x - (player.origin.x - borderFarW) > -(levelWidth * cell.x - tWidth)) {
			//move level left and keep player in place
			level.origin.x -= (player.origin.x) - borderFarW
			player.origin.x = borderFarW
		}
	}

	//vertical
	if (player.origin.y < borderNearH) {
		if (borderNearH - player.origin.y + level.origin.y < 0) {
			//move level down and keep player in place
			level.origin.y += borderNearH - player.origin.y
			player.origin.y = borderNearH
		}
	} else if (player.origin.y > borderFarH) {
		if (level.origin.y - (player.origin.y - borderFarH) > -(levelHeight * cell.y - tHeight)) {
			//move level up and keep player in place
			level.origin.y -= player.origin.y - borderFarH
			player.origin.y = borderFarH
		}
	}
}
