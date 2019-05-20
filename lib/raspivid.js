"use strict";

const util = require('util');
const spawn = require('child_process').spawn;
const merge = require('mout/object/merge');
const ps = require('ps-node');

const Server = require('./_server');


class RpiServer extends Server {

  constructor(server, opts) {
    super(server, merge({
      fps: 30,
      width: 640,
      height: 480,
    }, opts));
  }

  get_feed() {
    var serv = this;
    var myPromise = new Promise(function(resolve, reject){

      var streamer;
      ps.lookup({
        command: 'raspivid',
      }, function (err, resultList) {
        if (err) {
          throw new Error(err);
        }
  
        resultList.forEach(function (process) {
          if (process) {
            console.log('PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments);
            ps.kill(process.pid, 'SIGKILL', function (err) {
              if (err) {
  
              }
              else {
                console.log('Process %s has been killed without a clean-up!', process.pid);
              }
            });
          }
        });
  
        var msk = "raspivid -t 0 -o - -w %d -h %d -fps %d";
        var cmd = util.format(msk, serv.options.width, serv.options.height, serv.options.fps);
        console.log(cmd);
        streamer = spawn('raspivid', ['-t', '0', '-o', '-', '-w', serv.options.width, '-h', serv.options.height, '-fps', serv.options.fps, '-pf', 'baseline']);
        streamer.on("exit", function (code) {
          console.log("Failure", code);
        });
  
        resolve(streamer.stdout);
    });
    


    });
    return myPromise;
  }

};



module.exports = RpiServer;
