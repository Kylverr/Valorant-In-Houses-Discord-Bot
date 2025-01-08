class Queue {
    const MAX_SIZE = 10;
    constructor(type) {
        this.queue = [];
    }

    add(user) {
        if (this.queue.includes(user)) {
            throw new Error(); 
        }

        this.queue.push(user);
        
        if (this.queue.length == MAX_SIZE) {
            return 1;
        }
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
}
export default Queue
