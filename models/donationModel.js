const dbManager = require('../data/dbManager');



// New class to handle donations
class DonationDao {

    constructor(dbManager) {

        if (dbManager) {
            this.dbManager = dbManager;
            console.log('Db connected to donation model');
        }
        else {
            throw new Error('No db manager provided');
        }
    }

    // Initialiser method for what items are needed
    async itemsNeededInitializer() {
        return new Promise((resolve, reject) => {


            // Create a new list of items needed by pantries
            const itemsNeeded = [
                { neededItem: 'Carrot', typeOfItem: 'Vegetable', 'currentStock': 0 },
                { neededItem: 'Apple', typeOfItem: 'Fruit', 'currentStock': 0 },
                { neededItem: 'Milk', typeOfItem: 'Dairy', 'currentStock': 0 },
                { neededItem: 'Bread', typeOfItem: 'Grain', 'currentStock': 0 },
                { neededItem: 'Chicken', typeOfItem: 'Meat', 'currentStock': 0 },
                { neededItem: 'Eggs', typeOfItem: 'Dairy', 'currentStock': 0 },
                { neededItem: 'Butter', typeOfItem: 'Dairy', 'currentStock': 0 },
                { neededItem: 'Mince', typeOfItem: 'Meat', 'currentStock': 0 },

            ]

            // Find each item in the database
            itemsNeeded.forEach(item => {
                this.dbManager.db.findOne({ neededItem: item.neededItem }, (err, obj) => {
                    if (err) {
                        console.error("Error finding item:", err);
                        reject(err);
                        return;
                    }

                    // If item exists, reject the promise
                    if (obj) {
                        console.error("Item already exists:", item.neededItem);
                        reject(new Error(`Item already exists: ${item.neededItem}`));
                        return;
                    }

                    // Seed some items needed
                    this.dbManager.db.insert(item, (err, objs) => {
                        if (err) {
                            console.error("Error inserting items needed:", err);
                            reject(err);
                            return;
                        }

                    });

                    // Else everything went well
                    console.log('Item:', item.neededItem, 'inserted successfully.');


                });
            });

            // Resolve the promise
            resolve();
        });
    }

    // Initialiser method
    async donationInitializer() {

        const expirydate = new Date();

        // Makes the food expire in 7 days
        expirydate.setDate(expirydate.getDate() + 7);

        return new Promise((resolve, reject) => {
            const donations =
                [
                    { userId: 'userId1', type: 'Vegetable', name: 'Carrot', quantity: 2, useByDate: expirydate, status: 'pending' },
                    { userId: 'userId2', type: 'Fruit', name: 'Apple', quantity: 3, useByDate: expirydate, status: 'pending' }
                ]


            donations.forEach(donation => {

                this.dbManager.db.findOne({ _id: donation._id }, (err, obj) => {
                    if (err) {
                        console.error("Error finding donation:", err);
                        reject(err);
                        return;
                    }

                    // If donation exists, reject the promise
                    if (obj) {
                        console.error("Donation already exists:", donation._id);
                        reject(new Error(`Donation already exists: ${donation._id}`));
                        return;
                    }

                    // Seed some donations
                    this.dbManager.db.insert(donation, (err, objs) => {
                        if (err) {
                            console.error("Error inserting donations:", err);
                            reject(err);
                            return;
                        }

                        // Went to plan
                        console.log("Donations inserted successfully.");


                    });

                });
            });
            resolve();
        });
    }

    // Get all items needed
    // Get all items needed
    async getItemsNeeded() {
        // Make new promise
        return new Promise((resolve, reject) => {
            this.dbManager.db.find({ neededItem: { $exists: true } }).sort({ typeOfItem: 1 }).exec((err, items) => {
                if (err) {
                    console.error('Error finding items needed:', err);
                    reject(err);
                    return;
                }

                resolve(items);
                console.log('Items needed returned from getItemsNeeded():', items);
            });
        });
    }

    async makeDonation(donation) {
        return new Promise((resolve, reject) => {
            // Insert donation
            this.dbManager.db.insert(donation, (err, obj) => {
                if (err) {
                    console.error("Error inserting donation:", err);
                    reject(err);
                    return;
                }

                console.log("Donation inserted successfully:", donation);
                resolve(obj._id);
            });
        });
    }

    // Update stock method
    async updateStock(item, qty) {
        return new Promise((resolve, reject) => {
            // Find the item
            this.dbManager.db.findOne({ neededItem: item }, (err, obj) => {
                if (err) {
                    console.error("Error finding item:", err);
                    reject(err);
                    return;
                }

                if (!obj) {
                    console.error("Item not found:", item);
                    reject(new Error("Item not found"));
                    return;
                }

                // Update the stock, make sure to parse it as an integer
                const updatedStock = obj.currentStock + parseInt(qty);

                // Update the item in the database
                // Parse the updated stock as an integer
                this.dbManager.db.update({ neededItem: item }, { $set: { currentStock: updatedStock } }, {}, (err) => {
                    if (err) {
                        console.error("Error updating stock:", err);
                        reject(err);
                        return;
                    }

                    console.log("Stock updated successfully for", item, "new stock:", updatedStock);
                    resolve(updatedStock);
                });
            });
        });
    }

    async addUserDonation(donationId, userId) {

        console.log('Adding donation to user:', donationId, userId);
        return new Promise((resolve, reject) => {
            if (!donationId || !userId) {
                console.error(" ID not found");
                reject(new Error("ID not found"));
                return;
            }
    
            // Construct the query to find the user by userId
            const query = { _id: userId };
    
            // Update the user document to push the donationId to the donations array
            this.dbManager.db.update(query, { $push: { donations: donationId } }, {}, (err) => {
                if (err) {
                    console.error("Error adding donation to user:", err);
                    reject(err);
                    return;
                }
    
                console.log("Added donation to user");
                resolve();
            });
        });
    }
    

}


const donation = new DonationDao(dbManager);
donation.donationInitializer();
donation.itemsNeededInitializer();
module.exports = donation;