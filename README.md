RunRun Rabbit
=============

Competitive puzzle game for two players. My entry for js13kgames 2013

Pre-requisites
--------------

Install node.js
Install grunt:
```
npm install -g grunt-cli
```

Getting started
---------------

Clone the repo

Build:
```
npm install
grunt
```

Run:
```
grunt run
```

Releasing
----------

First shrinkwrap npm packages
```
npm shrinkwrap
```
(Run ```npm prune``` if there are any extraneous packages)

### By archive (e.g. modulus)
```
grunt release:zip
```
Then upload build/release/server.zip

### By git (e.g. heroku)
```
grunt release:git
cd release
git push heroku master
```