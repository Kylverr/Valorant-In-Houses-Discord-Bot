class Queue {
    constructor() {
        this.queue = [];
    }

    add(user) {
        if (!this.queue.includes(user)) {
            this.queue.push(user);
            console.log(`Added ${user}`);
        }
        else 
            console.log(`User already added`);
    }

    remove(user) {
        const index = this.queue.indexOf(user);
        if (index > -1) {
            this.queue.splice(index, 1);
            console.log(`Removed ${user}`);
        }
        else {
            console.log(`User already removed`);
        }
    }
    getSize() {
        return this.queue.length;
    }

    getQueue() {
        return this.queue;
    }
}
export default Queue
