//Game Objects
//////////////

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
				if (rowI < 6) {
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
	hSpeed: 50,
	vSpeed: 50,
	g: 100,
	hMax: 10,
	vMax: 20,
	jumpStrength: 0,
	jAllowance: 0,
	isGrounded: false,
	drill: false,
	drillCount: 3,
	drillStrength: 3,
	rateOfFire: 1,
	direction: 'right',
	//bullets,
	//lastShot,
	move: function() {

		if (iRight) {
			this.direction = 'right'
		}
		if (iLeft) {
			this.direction = 'left'
		}
		if (iUp) {
			this.direction = 'up'
		}


		if (!this.isGrounded && iDown && this.drillCount > 0) {
			this.drill = true
		} else {
			this.drill = false
		}

		//buffer for delayed jump input
		if (!iJump) {
			if (this.isGrounded) {
				this.jumpStrength = 20
				this.jAllowance = 1
			} else {
				if (this.jAllowance > 0) {
					this.jumpStrength = 20	
					this.jAllowance--				
				} else {
					this.jumpStrength = 0
				}
			}
		}

		//limiter for held jump
		if (ver < 0) {
			if (this.jumpStrength > 0) {
				this.drillCount = this.drillStrength
				this.jumpStrength--
			} else {
				ver = 0
			}
		}

		this.hSpeed = Math.clamp(this.hSpeed + 20, 10, this.speed)
		this.vSpeed = Math.clamp(this.vSpeed + 20, 10, this.speed)
		this.g = Math.clamp(this.g * 2, 100, 1000)
		
		//next position (before collision)
		this.velocity.x = Math.clamp((this.velocity.x + (hor  * this.hSpeed)) * delta, -this.hMax, this.hMax)
		this.velocity.y = Math.clamp(((this.velocity.y + (ver * this.vSpeed) + this.g) * delta), -this.vMax, this.vMax) 
		
		//adds responsiveness to controls
		if ((this.velocity.x > 0 && hor < 0) || (this.velocity.x < 0 && hor > 0)) {
			this.velocity.x = 0
			this.hSpeed = 50
		}
		if (hor === 0 && Math.abs(this.velocity.x) < 0.01) {
			this.velocity.x = 0
			this.hSpeed = 50
		}
	
		let nextX
		let nextY
		let checkRow
		let checkBlock

		//collision right
		if (this.velocity.x > 0) {
			nextX = this.origin.x + this.size.x + this.velocity.x
			if (nextX - level.origin.x > cell.x * levelWidth) {
				this.velocity.x = Math.min(0, this.velocity.x)
			} else {
				checkBlock = Math.floor((nextX - level.origin.x) / cell.x)
				if (checkBlock >= 0 && checkBlock !== undefined) {
					let top = this.origin.y + 1
					let bottom = this.origin.y + this.size.y - 1
					let blockTRow = level.rows[Math.floor((top - level.origin.y) / cell.y)]
					let blockT = blockTRow !== undefined ? blockTRow[checkBlock] : null
					let blockBRow = level.rows[Math.floor((bottom - level.origin.y) / cell.y)]
					let blockB = blockBRow !== undefined ? blockBRow[checkBlock] : null
					if (blockT) {
						this.origin.x = (blockT.origin.x + level.origin.x) - (this.size.x + 1)
						this.velocity.x = Math.min(0, this.velocity.x)
					} else if (blockB) {
						this.origin.x = (blockB.origin.x + level.origin.x) - (this.size.x + 1)
						this.velocity.x = Math.min(0, this.velocity.x)
					}
				}
			}
		//collision left
		} else if (this.velocity.x < 0) {
			nextX = this.origin.x + this.velocity.x
			if (nextX - level.origin.x < 0) {
				this.velocity.x = Math.max(0, this.velocity.x)
			} else {
				checkBlock = Math.floor((nextX - level.origin.x) / cell.x)
				if (checkBlock >= 0 && checkBlock !== undefined) {
					let top = this.origin.y + 1
					let bottom = this.origin.y + this.size.y - 1
					let blockTRow = level.rows[Math.floor((top - level.origin.y) / cell.y)]
					let blockT = blockTRow !== undefined ? blockTRow[checkBlock] : null
					let blockBRow = level.rows[Math.floor((bottom - level.origin.y) / cell.y)]
					let blockB = blockBRow !== undefined ? blockBRow[checkBlock] : null
					if (blockT) {
						this.origin.x = blockT.origin.x + level.origin.x + cell.x + 1
						this.velocity.x = Math.max(0, this.velocity.x)
					} else if (blockB) {
						this.origin.x = blockB.origin.x + level.origin.x + cell.x + 1
						this.velocity.x = Math.max(0, this.velocity.x)
					}
				}
			} 
		}
		//collision down
		if (this.velocity.y > 0) {
			nextY = this.origin.y + this.size.y + this.velocity.y
			if (nextY - level.origin.y > cell.y * levelHeight) {
				this.velocity.y = Math.min(0, this.velocity.y)
			} else {
				checkRow = Math.floor((nextY - level.origin.y) / cell.y)
				if (checkRow >= 0 && checkRow !== undefined) {
					let left = this.origin.x + this.velocity.x
					let right = this.origin.x + this.size.x + this.velocity.x
					let blockL = level.rows[checkRow][Math.floor((left - level.origin.x) / cell.x)]
					let blockR = level.rows[checkRow][Math.floor((right - level.origin.x) / cell.x)]
					let drilled = false
					if (blockL) {
						if (!this.drill) {
							this.origin.y = (blockL.origin.y + level.origin.y) - this.size.y
							this.velocity.y = Math.min(0, this.velocity.y)
							this.isGrounded = true
							this.g = 100
						} else {
							level.rows[checkRow][Math.floor((left - level.origin.x) / cell.x)] = null
							drilled = true							
						}
					}
					if (blockR) {
						if (!this.drill) {
							this.origin.y = (blockR.origin.y + level.origin.y) - this.size.y
							this.velocity.y = Math.min(0, this.velocity.y)
							this.isGrounded = true
							this.g = 100
						} else {
							level.rows[checkRow][Math.floor((right - level.origin.x) / cell.x)] = null
							drilled = true
						}
					} 
					if (!blockR && !blockL) {
						this.isGrounded = false
					}
					if (drilled) {
						this.drillCount--
					}
				}
			}
		//collision up
		} else if (this.velocity.y < 0) {
			nextY = this.origin.y + this.velocity.y
			if (nextY - level.origin.y < 0) {
				this.velocity.y = Math.max(0, this.velocity.y)
			} else {
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
		} 
		this.origin.x += this.velocity.x
		this.origin.y += this.velocity.y
	},
	fire: function() {
//spawn bullet in origin determined by direction and pass speed params accordingly
		switch (this.direction) {
			case 'right':
				this.bullets.add(new Bullet(
					{
						x: (this.origin.x + this.size.x + 3) - level.origin.x, 
						y: (this.origin.y + 5) - level.origin.y
					},
					20,
					0
				))
				this.lastShot = Date.now()
				break
			case 'left':
				this.bullets.add(new Bullet(
					{
						x: (this.origin.x - 13) - level.origin.x, 
						y: (this.origin.y + 5) - level.origin.y
					},
					-20,
					0
				))
				this.lastShot = Date.now()
				break
			case 'up':
				this.bullets.add(new Bullet(
					{
						x: (this.origin.x + 5) - level.origin.x, 
						y: this.origin.y - 13 - level.origin.y
					},
					0,
					-20
				))
				this.lastShot = Date.now()
				break
			default:
				break
		}
	}
}

class Bullet extends Node{
	constructor(origin, hSpeed, vSpeed, size = {x:10, y:10}) {
		super()
		this.origin = origin
		this.size = size
		this.hSpeed = hSpeed
		this.vSpeed = vSpeed
	}
	check() {		
		this.move()
		// //needs collision logic ([x]destroy or [ ]damage target)
		// 	this.collision()
		// 		this.damage()
		// 		this.remove()
		if (this.willRemove) {
			this.remove()
		}
	}
	draw() {
		drawObject(this, 'red')
	}
	move() {
		let nextX = this.origin.x + this.hSpeed
		let nextY = this.origin.y + this.vSpeed

		let checkRow
		let checkBlock
		//boundary right
		if (nextX + this.size.x > cell.x * levelWidth) {
			this.willRemove = true
			return
		}
		//boundary left
		if (!this.willRemove && nextX < 0) {
			this.willRemove = true
			return
		}
		//boundary top
		if (!this.willRemove && nextY < 0) {
			this.willRemove = true
			return
		}
		//boundary right
		if (!this.willRemove && nextY + this.size.y > cell.y * levelHeight) {
			this.willRemove = true
			return
		}

		//collision with level
		if (!this.willRemove) {
			let topLeft = {x: nextX, y: nextY}
			let bottomLeft = {x: nextX, y: nextY + this.size.y}
			let bottomRight = {x: nextX + this.size.x, y: nextY + this.size.y}
			let topRight = {x: nextX + this.size.x, y: nextY}
			let collision = false

			if (level.rows[Math.floor(topLeft.y / cell.y)][Math.floor(topLeft.x / cell.x)] != null) {
				level.rows[Math.floor(topLeft.y / cell.y)][Math.floor(topLeft.x / cell.x)] = null
				collision = true
			}
			if (level.rows[Math.floor(bottomLeft.y / cell.y)][Math.floor(bottomLeft.x / cell.x)] != null) {
				level.rows[Math.floor(bottomLeft.y / cell.y)][Math.floor(bottomLeft.x / cell.x)] = null
				collision = true
			}
			if (level.rows[Math.floor(bottomRight.y / cell.y)][Math.floor(bottomRight.x / cell.x)] != null) {
				level.rows[Math.floor(bottomRight.y / cell.y)][Math.floor(bottomRight.x / cell.x)] = null
				collision = true
			}
			if (level.rows[Math.floor(topRight.y / cell.y)][Math.floor(topRight.x / cell.x)] != null) {
				level.rows[Math.floor(topRight.y / cell.y)][Math.floor(topRight.x / cell.x)] = null
				collision = true
			}
			
			if (collision) {
				this.willRemove = true
			}
		}
		if (!this.willRemove) {
			this.origin.x = nextX
			this.origin.y = nextY
		}

	}
}

class Enemy extends Node {
	constructor(origin, size, health, isBoss = false) {	
		super()	
		this.isBoss = isBoss
		this.size = size
		this.origin = origin
		this.health = health
		this.hSpeed = 0
		this.vSpeed = 0
	}
	spawn() {
		//Boundary corners (adjusted to level array positions)
		const tL = {
			x: Math.clamp(Math.floor((this.origin.x + (-2 * this.size.x)) / cell.x), 0, levelWidth),
			y: Math.clamp(Math.floor((this.origin.y + (-1 * this.size.y)) / cell.y), 0, levelHeight)
		}		
		const bR = {
			x: Math.clamp(Math.floor((this.origin.x + (3 * this.size.x)) / cell.x), 0, levelWidth),
			y: Math.clamp(Math.floor((this.origin.y + (2 * this.size.y)) / cell.y), 0, levelHeight)
		}

		//Clear space for enemy
		for(row = tL.y; row < bR.y; row++) {
			for(block = tL.x; block < bR.x; block++) {
				if(level.rows[row][block] != null) {
					level.rows[row][block] = null
				}
			}
		}
		
	}
	target() {
		
	}
}
class Shooter extends Enemy {
	constructor(origin, size, health) {
		super(origin, size, health)
	}
	check() {

	}
	attack() {

	}
}