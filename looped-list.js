class Node {
	constructor(data, next = null, previous = null) {
		this.data = data;
		this.next = next;
		this.previous = previous;
	}

	setNext(node) {
		this.next = node;
	}

	setPrevious(node) {
		this.previous = node;
	}
}

class LoopedList {
	constructor() {
		this.length = 0;
	}

	add(data) {
		if (this.length == 0) {
			this.node = new Node(data, null, null);
			this.node.next = this.node;
			this.node.previous = this.node;
		}
		else {
			this.node.previous.next = new Node(data, this.node, this.node.previous);
			this.node.previous = this.node.previous.next;
		}

		this.length++;
	}

	get() {
		return this.getNode().data;
	}

	getNode() {
		if (this.length == 0) {
			return null;
		}
		else {
			this.node = this.node.next;
			return this.node.previous;
		}
	}

	peek() {
		return this.peekNode().data;
	}

	remove(data) {
		let node = this.node;

		for (let i = 0; i < this.length; i++) {
			node = node.next;

			if (node.data == data) {
				detachNode(node);
				this.length--;
				if (node == this.node) {
					this.node = this.node.next;
				}
			}
		}
	}

	peekNode() {
		if (this.length == 0) {
			return null;
		}
		else {
			return this.node;
		}
	}

	removeNode() {
		detachNode(this.node);
		this.node = this.node.next;
		this.length--;
	}

	size() {
		return this.length;
	}
}

function detachNode(node) {
	node.previous.next = node.next;
	node.next.previous = node.previous;
}

module.exports = LoopedList;
