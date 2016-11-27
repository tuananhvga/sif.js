# SIF.js
Private Server for School Idol Festival written in JavaScript.
Currently nothing can actually be done in game.

#### SETUP
  - Add HMAC Secret to `HMAC_SECRET.KEY` file
  - Add Decrypted game databases to `/db/game`
  - Install dependancies with `npm install`
  - Run server with `node index.js`
  - Modify Client's config to point to server*
  - Patch client to ignore `x-message-sign` header
  
  *Server runs on Port 8081 can be changed in `index.js` near the end of file.

Welcome to the world of my crappy coding. You'll see things that'll make you cringe. What is commenting?

### Required Game Databases
  - `unit.db_`
  - `item.db_`