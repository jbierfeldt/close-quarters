class PubSub {

	constructor() {
		this.subscribers = {};
	}

	subscribe(event, callback) {
		let index;
		const that = this;

		if (!this.subscribers[event]) {
			this.subscribers[event] = [];
		}

		index = this.subscribers[event].push(callback) - 1;

		return {
			unsubscribe() {
				that.subscribers[event].splice(index, 1);
			}
		}
	}

	publish(event, data) {
		if (!this.subscribers[event]) return;

		this.subscribers[event].forEach(subscriberCallback => {
			subscriberCallback(data);
		});
	}

}