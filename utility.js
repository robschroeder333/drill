//Utility functions
///////////////////

Math.clamp = function(number, min, max) {
	return Math.max(min, Math.min(number, max));
}

function drawObject(obj, color) {
	ctx.save()
	ctx.translate(obj.origin.x + level.origin.x, obj.origin.y + level.origin.y)
	ctx.fillStyle = color
	ctx.fillRect(0, 0, obj.size.x, obj.size.y)
	ctx.restore()
}

function canFire() {
	if ((player.bullets.head == null && ((time - player.lastShot)/1000 >= player.rateOfFire / 2)) 
		|| (time - player.lastShot)/1000 >= player.rateOfFire) {
		return true
	} else {
		return false
	}
}

class Node {
	constructor() {
		this.source
		this.next = null
		this.prev = null
		this.willRemove = false
	}
	remove() {
		//middle of list
		if (this.next && this.prev) {
			this.next.prev = this.prev
			this.prev.next = this.next
		//head of list
		} else if (this.prev == null) {
			this.source.head = this.next
			if (this.next) {
				this.next.prev = null
			}
		//tail of list
		} else {
			this.prev.next = null
		}

	}
}
class Collection {
	constructor() {
		this.head = null
	}
	add(node) {
		node.source = this
		if (this.head != null) {
			node.next = this.head
			this.head.prev = node
		}
		this.head = node
	}
	checkAll() {
		this.step(this.head)
	}
	step(node) {
		if (node == null) {
			return
		}
		node.check()
		this.step(node.next)
	}
	drawAll() {
		this.drawOne(this.head)
	}
	drawOne(node) {
		if (node == null) {
			return
		}
		node.draw()
		this.drawOne(node.next)
	}
}