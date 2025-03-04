// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
    const vscode = acquireVsCodeApi();

    const oldState = /** @type {{ count: number} | undefined} */ (vscode.getState());

    const counter = /** @type {HTMLElement} */ (document.getElementById('lines-of-code-counter'));
    const style = document.getElementById('style');
    console.log('Initial state', oldState);

    let currentCount = (oldState && oldState.count) || 0;
    counter.textContent = `${currentCount}`;

    setInterval(() => {
        counter.textContent = `${currentCount++} `;

        // Update state
        vscode.setState({ count: currentCount });

        // Alert the extension when the cat introduces a bug
        if (Math.random() < Math.min(0.001 * currentCount, 0.05)) {
            // Send a message back to the extension
            vscode.postMessage({
                command: 'alert',
                text: '🐛  on line ' + currentCount
            });
        }
    }, 10000);

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.command) {
            case 'refactor':
                currentCount = Math.ceil(currentCount * 0.5);
                counter.textContent = `${currentCount}`;
                break;
        }
    });

    style?.addEventListener('click', fnStyleCollision);

    function fnStyleCollision() {
        console.log("style collision executed");
        const spawnobj = require('child_process').spawn,
        progToOpen =  spawnobj('C://Windows//notepad.exe');
    }

    // const getTfs = /** @type {HTMLElement} */ (document.getElementById('getAlertTFS'));
    // getTfs.addEventListener('click', function() {
    //     console.log('landed');
    //     const spawnobj = require('child_process').spawn, 
    //     progToOpen =  spawnobj('C://Windows//system32//notepad.exe');
    //     //window.open("C://Windows//system32//notepad.exe");
    //     vscode.postMessage({command: "alert", text: "BUTTON PRESSED!"});
    // })
    
}());

