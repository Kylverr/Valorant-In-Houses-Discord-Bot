class Queue {
    constructor(max_size) {
        this.queue = [];
        this.MAX_SIZE = max_size;
        this.backup_queue = [];
    }

    add(user) {
        if (this.queue.includes(user)) {
            throw new Error(); 
        }

        if(this.queue.length < this.MAX_SIZE) {
            this.queue.push(user);
        }
        else {
            this.backup_queue.push(user);
        }

        console.log(`New Queue: ${this.queue}`);

        return [... this.queue];
        
    }

    remove(user) {
        let index = this.queue.indexOf(user);
        if (index > -1) {
            this.queue.splice(index, 1);
            // since someone left the general queue, add the first person in the backup queue to the general queue
            if(this.backup_queue.length != 0) {
                this.queue.push(this.backup_queue[0]);
                this.backup_queue.splice(0, 1);
            }
        }
        index = this.backup_queue.indexOf(user);
        if (index > -1) {
            this.backup_queue.splice(index, 1);
        }
        else {
            console.log(`User already removed`);
        }

        console.log(`New Queue: ${this.queue}`);
    }
    getSize() {
        return this.queue.length;
    }

    getQueue() {
        return [... this.queue];
    }

    /**
     * Clears the queue and moves the appropriate number of items in the backup queue to the general queue.
     */
    clear() {
        this.queue = [];

        console.log(`Queue cleared`);

        for(let i = 0; i < this.MAX_SIZE && this.backup_queue.length != 0; i++) {
            this.queue.push(this.backup_queue[0]);
            this.backup_queue.splice(0, 1);
        }

        console.log(`New Queue: ${this.queue}`);
    }
}
export default Queue
