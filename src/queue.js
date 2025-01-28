class Queue {
    constructor(type) {
        this.queue = [];
    }

    add(user) {
        if (this.queue.includes(user)) {
            throw new Error(); 
        }

        this.queue.push(user);

        return [... this.queue];
        
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
        return this.queue.length;
    }

    getQueue() {
        return [... this.queue];
    }

    /**
     * Clears the queue
     */
    clearQueue() {
        this.queue = [];
    }
}
export default Queue
