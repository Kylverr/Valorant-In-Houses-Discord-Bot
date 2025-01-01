class Queue {
    constructor() {
        this.queue = [];
    }

    add(user) {
        if (!this.queue.includes(user)) {
            this.queue.push(user);
            console.log(`Added ${user} to queue`);
        }
        else 
            console.log(`User already added to queue`);
    }

    remove(user) {
        console.log(`Current queue: ${this.queue}`);
        console.log(`Finding: ${user}`);
        const index = this.queue.indexOf(user);
        if (index > -1) {
            this.queue.splice(index, 1);
            console.log(`Removed ${user}`);
            console.log(`New size: ${this.queue.length}`);
        }
        else {
            console.log(`User already removed`);
        }
    }
    getSize() {
        console.log(`Length is: ${this.queue.length}`);
        return this.queue.length;
    }

    getQueue() {
        return [... this.queue];
    }
}
export default Queue
