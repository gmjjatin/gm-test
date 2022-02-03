const execFile = require('child_process').execFile;
const {spawn} = require('child_process');

function controlBrightness(brightness) {//-1.0 to 1.0. The default value is "0". 

    const echo = spawn('echo', ['eq@my', 'brightness', `${brightness}`]);
    const zmq = spawn('zmqsend', []);

    echo.stdout.pipe(zmq.stdin);

    zmq.stdout.on('data', (data) => {
        console.log(`Number of files ${data}`);
    });
}

function controlContrast(contrast) {//-1.0 to 2.0. The default value is "1". 

    const echo = spawn('echo', ['eq@my', 'contrast', `${contrast}`]);
    const zmq = spawn('zmqsend', []);

    echo.stdout.pipe(zmq.stdin);

    zmq.stdout.on('data', (data) => {
        console.log(`Number of files ${data}`);
    });
}


// setTimeout(function() {controlBrightness("0.3")},  10000);
// setTimeout(function() {controlContrast("-0.1")},  15000);


function controlBalance(wb) {//180 to 360/0 to  180 The default value is either 0 or 360. 

    const echo = spawn('echo', ['hue@my', 'h', `${wb}`]);
    const zmq = spawn('zmqsend', []);

    echo.stdout.pipe(zmq.stdin);

    zmq.stdout.on('data', (data) => {
        console.log(`Number of files ${data}`);
    });
}
/**
 * 
 * angle = 1.57 for 90 degress
 * 3.14 for 180 degrees
 * 4.71 for 270 degrees
 * 0 for back to 0 degrees
 */
function rotate(angle) {

    const echo = spawn('echo', ['rotate@my', 'a', `${angle}`]);
    const zmq = spawn('zmqsend', []);

    echo.stdout.pipe(zmq.stdin);

    zmq.stdout.on('data', (data) => {
        console.log(`Number of files ${data}`);
    });
}

// var counter = 0, x=0,y=0;

// var increase = 10*(Math.PI/180);
// console.log("increase ", increase)

// function sineWave() {
//     for(x=0; x<=180; x+=10){
    
//        yr =  Math.cos(counter).toFixed(2);
//        yg =  Math.sin(counter).toFixed(2);
//        yb =  Math.cos(counter +Math.PI).toFixed(2);
//       counter += increase;
//         if(yr < 0)
//         yr =0;// " increase : " + counter
//         if(yg < 0)
//         yg = 0;
//         if(yb< 0)
//         yb = 0;
//         mix = 'rr '+yr+' gg '+yg+' bb '+yb;
//         console.log(mix);
   
//    }

// }

// sineWave();