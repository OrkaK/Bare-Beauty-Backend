# Bare Beauty Backend API

This is the Node.js/Express backend service for the Bare Beauty e-commerce application. It powers the product search engine, connects to the MongoDB database, and handles secure user authentication.

## Local Setup Instructions for the Team

If you are pulling down the frontend code to work on it locally, you **must** also run this backend server, otherwise the Search Bar and Shop pages will show "0 Products"!

Follow these two simple steps to get the environment running from scratch:

### Step 1: Start the Local Database (via Docker)
We use Docker to easily spin up a local MongoDB instance.
1. Open the **Docker Desktop** application on your computer so the daemon is running.
2. Open your terminal and run this exact command to create and run a fresh MongoDB database in the background:
   ```bash
   docker run -d -p 27017:27017 --name bare-beauty-db mongo
   ```

### Step 2: Start the Active Backend Server
Once Docker has locked port `27017` for the database, you need to turn the actual Node.js API on!
1. Open a new terminal window.
2. Navigate into your cloned `bare-beauty-backend` folder.
3. (Optional) Run `npm install` just in case there are new packages.
4. Finally, start the backend heavily by running:
   ```bash
   npm run dev
   ```

**The Check:** Once your terminal flashes `Connected to MongoDB`, you are officially good to go! You can now open the frontend site, search for "Toner" or "Shampoo", and it will flawlessly pull all the items straight from the database! Let us know if you have any issues setting it up.
