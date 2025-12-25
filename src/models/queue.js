class Queue {
    constructor({ game, maxSize }) {
        this.game = game;
        this.MAX_SIZE = maxSize;
        this.players = [];
        this.backupQueue = [];
    }

    add(user) {
        if (this.players.includes(user)) {
            throw new Error(); 
        }

        if(this.players.length < this.MAX_SIZE) {
            this.players.push(user);
        }
        else {
            this.backupQueue.push(user);
        }

        console.log(`New Queue: ${this.players}`);

        return [... this.players];
        
    }

    remove(user) {
        let index = this.players.indexOf(user);
        if (index > -1) {
            this.players.splice(index, 1);
            // since someone left the general queue, add the first person in the backup queue to the general queue
            if(this.backupQueue.length != 0) {
                this.players.push(this.backupQueue[0]);
                this.backupQueue.splice(0, 1);
            }
        }
        index = this.backupQueue.indexOf(user);
        if (index > -1) {
            this.backupQueue.splice(index, 1);
        }
        else {
            console.log(`User already removed`);
        }

        console.log(`New Queue: ${this.players}`);
    }
    getSize() {
        return this.players.length;
    }

    getQueue() {
        return [... this.players];
    }

    /**
     * Clears the queue and moves the appropriate number of items in the backup queue to the general queue.
     */
    clear() {
        this.players = [];

        console.log(`Queue cleared`);

        for(let i = 0; i < this.MAX_SIZE && this.backupQueue.length != 0; i++) {
            this.players.push(this.backupQueue[0]);
            this.backupQueue.splice(0, 1);
        }

        console.log(`New Queue: ${this.players}`);
    }
}
export default Queue
