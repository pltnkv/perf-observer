(() => {
    
    

    let timeFrames = []
    let totalInteractionsCount = 0 //totalInteractionsCount //only clicks for now
    let badInteractionsCount = 0 //only clicks for now
    let numberOfFreezes = 0

    // interaction is short period of time when users interact with canvas
    // user can have many interactions during one session
    function cleanupBeforeNextInteraction() {
        totalInteractionsCount = 0
        badInteractionsCount = 0
        numberOfFreezes = 0
        timeFrames = []
    }
    
    function calcPerformanceScore() {

        //check spickes since firstUserActionTime
        const curTime = performance.now()
        const userInteractionDurationInMs = curTime - firstUserActionTime
        firstUserActionTime = undefined

        let timeFrameSum = 0
        let hasSmallFreezes = false
        let hasMediumFreezes = false
        let hasDeadFreezes = false
        for(let i = timeFrames.length - 1; i--; i >= 0) {
            const timeFrame = timeFrames[i]
            timeFrameSum+=timeFrame

            if(100 < timeFrame && timeFrame < 300) {
                hasSmallFreezes = true
            }

            if(300 < timeFrame && timeFrame < 600) {
                hasMediumFreezes = true
            }

            if(600 < timeFrame) {
                hasDeadFreezes = true
            }




            if(timeFrameSum > userInteractionDurationInMs) {
                break;
            }
        }

        if(hasDeadFreezes) {
            numberOfFreezes += 1;
            badInteractionsCount += 1;
        } else if (hasMediumFreezes) {
            badInteractionsCount += 1;
        } else if (hasSmallFreezes) {
            badInteractionsCount +=0.5;
        }


         //0 is PERFECT, 1 is VERY BAD
        const performanceScore =  badInteractionsCount / totalInteractionsCount


        // probably if there is at least one freeze during long interaction - score should be 1 — VERY BAD
        //console.log(`TF: PerfScore:${performanceScore.toFixed(2)}, totalIntCount:${totalInteractionsCount}, badIntCount:${badInteractionsCount}, freezesCount:${numberOfFreezes}, `)
        div.innerText = `S:${performanceScore.toFixed(2)} T:${totalInteractionsCount} B:${badInteractionsCount} F:${numberOfFreezes}`
        console.table(timeFrames)
        
        if(performanceScore < 0.1 && !hasMediumFreezes && !hasDeadFreezes) {
            div.style.backgroundColor = `#bcffc5` // PERFECT
        } else if(performanceScore < 0.2 && !hasDeadFreezes) {
            div.style.backgroundColor = `#ffbc00` // ACCEPTABLE
        } else if(performanceScore < 0.3 && !hasDeadFreezes) {
            div.style.backgroundColor = `#ffbcef` // NOT GOOD
        } else if(hasDeadFreezes) {
            div.style.backgroundColor = `#ff0000` // DOES NOT WORK
        } else {
            div.style.backgroundColor = `#0000FF` // WTF?
        }
        
    }
    
    // clean up timeFrames every 5 min
    // TODO find moments of active interaction with canvas and measure performance score of particalar timeframe, but not whole session


    let firstUserActionTime = undefined
    const debouncedCalcPerformanceScore = debounce(calcPerformanceScore, 1000)

    document.body.addEventListener('click', (e) => {
        const clickByCanvas = e.target?.tagName === 'CANVAS'
        if(firstUserActionTime === undefined) {
            if(clickByCanvas) { //activate only if click by canvas, dont care about BoardUI as trigger
                cleanupBeforeNextInteraction()
                firstUserActionTime = performance.now()

                debouncedCalcPerformanceScore()
                totalInteractionsCount++
            }
            
        } else {
            debouncedCalcPerformanceScore()
            totalInteractionsCount++
        }        
    }, true)

    // document.body.addEventListener('mousedown', () => {
        // console.log('mousedown true')
    // }, true)

    // document.body.addEventListener('mousedown', () => {
        // console.log('mousedown false')
    // }, false)


    let lastT = 0

    function checkDelta() {
        const curT = performance.now()
        const delta = curT - lastT

        if(document.visibilityState === 'visible') { 
            timeFrames.push(delta)
        }

        lastT = curT
        requestAnimationFrame(checkDelta)
    }

    requestAnimationFrame(checkDelta)

    // Utils

    function debounce(f, t) {
      return function (args) {
        let previousCall = this.lastCall;
        this.lastCall = Date.now();
        if (previousCall && ((this.lastCall - previousCall) <= t)) {
          clearTimeout(this.lastCallTimer);
        }
        this.lastCallTimer = setTimeout(() => f(args), t);
      }
    }

    // UI 

    const div = document.createElement('div')
    div.style.position = 'absolute'
    div.style.zIndex = '1000000'
    div.style.top = '64px'
    div.style.right = '8px'
    div.style.width = '160px'
    div.style.height = '20px'
    div.style.borderRadius = '4px'
    div.style.backgroundColor = 'white'
    div.style.boxSizing = 'border-box'
    div.style.paddingLeft = '4px'
    div.style.boxShadow = '0px 2px 10px rgba(5, 0, 56, 0.08)'
    
    document.body.appendChild(div)

})()

// idea - measure frame tick only within 5sec on user actions: keyboard, click, mousedonw, mouseup
// for slow events we can safe assotiated events to remember what button was clicked ()
//- param board-options: 

