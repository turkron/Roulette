const NumbersToDraw = (min, max) => {
    return _.range(min, max).map(num => {
        return {
            number: num.toString(),
            state: num % 2 == 0 ? "even" : "odd",
            colour: num % 2 == 0 ? "red" : "black"
        }
    })
};

const getEl = elname => document.getElementById(elname.toString());

let startScreen,
    gameScreen,
    endScreen,
    playerAccountValue,
    output,
    rouletteOutput,
    finishedButton,
    winningNumber,
    playerStartingAccountValue = 120,
    winningOutcomeText,
    BettingObject = {
        odd: 0,
        even: 0,
        red: 0,
        black: 0
    },
    nums = NumbersToDraw(1, 37);


nums = nums.concat([{ number: "0", state: "n/a", colour: "green" }, { number: "00", state: "n/a", colour: "green" }]);
nums.map(obj => BettingObject[obj.number] = 0);

let createSection = (textValue, tarDes) => {
    let template,
        clone,
        td;
    if (textValue == "empty") {
        template = getEl("emptySection");
        clone = document.importNode(template.content, true);
        td = clone.querySelectorAll("td")[0];
    } else {
        //get template
        template = getEl("bettingSection");
        //clone template
        clone = document.importNode(template.content, true);
        td = clone.querySelectorAll("td")[0];
        //customise clone
        td.children[0].textContent = textValue;
        td.children[1].textContent = "stake: 0";
        td.children[2].addEventListener("click", () =>  increaseStake(textValue, td.children[1]));
        td.children[3].addEventListener("click", () =>  decreaseStake(textValue, td.children[1]));
    }

    //attach clone
    getEl(tarDes).appendChild(td);
};

const increaseStake = (value, stakeText) => {
    if (BettingObject[value] == undefined) BettingObject[value] = 0;
    BettingObject[value]++;
    stakeText.textContent = "stake: " + BettingObject[value];
};
const decreaseStake = (value, stakeText) => {
    if (BettingObject[value] == undefined) BettingObject[value] = 0;
    BettingObject[value]--;
    if (BettingObject[value] < 0) { BettingObject[value] = 0;}
    stakeText.textContent = "stake: " + BettingObject[value];
};

const consecNumbers = (baseNum, inarow) =>  _.range(baseNum, baseNum + (inarow)).toString();
const twoInRow = _.partial(consecNumbers, _, 2);
const threeInRow = _.partial(consecNumbers, _, 3);

let tableLayout = [
    ["red", "black", "empty", "empty", "odd", "even"]
]
    .concat(_.chunk(_.range(1, 37), 6))
    .concat(_.chunk(_.range(1, 36).map(twoInRow), 6))
    .concat(_.chunk(_.range(1, 35).map(threeInRow), 6));



const startGame = (numberOfPlayers) => {
    startScreen = getEl("StartScreen");
    gameScreen = getEl("GameScreen");
    endScreen = getEl("EndGameScreen");
    winningOutcomeText = getEl("winningOutcome");
    playerAccountValue = getEl("player0AccountValue");
    playerAccountValue.textContent = "$" + playerStartingAccountValue;
    output = getEl("textOutput");
    rouletteOutput = getEl("RouletteOutput");
    finishedButton = getEl("playGame");
    tableLayout.map((row, index) => {
        row.map(elementName => {
            createSection(elementName, "row" + index);
        })
    })
    startScreen.style.visibility = "hidden";
    gameScreen.style.visibility = "visible";

    //show game screen, should contain a number grid for the player to bet on, and an outcome panel. 
    //should also show the player info and money. 

}

const resolveGame = () => {
    //get all stakes and deduct them from player account;
    console.log(BettingObject);
    let totalBet = 0;
    _.mapValues(BettingObject, (n) => totalBet += n)

    if (totalBet > playerStartingAccountValue) {
        window.alert("bet not placed, not enough funds. total bet value = $"+ totalBet + ", your funds = $"+ playerStartingAccountValue)
        return;
    }
        //if player has enough to play with set stake values;
    else {playerStartingAccountValue -= totalBet;}

    playerAccountValue.textContent = "$" + playerStartingAccountValue;

    winningNumber = DrawNumber();
    output.textContent = winningNumber.number;
    output.style.color = winningNumber.colour == "black" ? "white" : "black";
    rouletteOutput.style.background = winningNumber.colour;
    
    calculateWinnings();
}

const calculateWinnings = () => {
    let winnings = 0;
    if (BettingObject[winningNumber.number] != undefined && BettingObject[winningNumber.state] != undefined && BettingObject[winningNumber.colour] != undefined) {
        if (BettingObject[winningNumber.number] != 0) winnings += (BettingObject[winningNumber.number] * 35);
        if (BettingObject[winningNumber.state] != 0) winnings += (BettingObject[winningNumber.state]*2);
        if (BettingObject[winningNumber.colour] != 0) winnings += (BettingObject[winningNumber.colour] * 2);
    }
    let potentialMatches = Object.keys(BettingObject)
        .filter(name => name.indexOf(",") != -1)
        .map(name => name.split(","))
        .map(function (name) {
            return name.map(function (number) {
                return parseInt(number);
            })
        })
        .filter(function (name) {
            console.log(name, winningNumber.number);
            return name.indexOf(parseInt(winningNumber.number)) != -1
        });
        

    //let twoCons = potentialMatches.filter(name => _.indexOf(name, ",") == _.lastIndexOf(name, ","));
    //let threeCons = potentialMatches.filter(name => _.indexOf(name, ",") != _.lastIndexOf(name, ","));

    console.log(potentialMatches);
    let twoCons = potentialMatches.filter(match => match.length == 2);
    let threeCons = potentialMatches.filter(match => match.length == 3);

    twoCons.map(matchName=> {
        if (BettingObject[matchName.toString()] != 0) winnings += (BettingObject[matchName] * 17)
    });

    threeCons.map(matchName=> {
       if (BettingObject[matchName.toString()] != 0) winnings += (BettingObject[matchName] * 11)
    });
    
    winningOutcomeText.textContent = winnings > 0 ? "Winner! $" + winnings : "No Win";

    playerStartingAccountValue += winnings;
    playerAccountValue.textContent = "$" + playerStartingAccountValue;
}

const DrawNumber = () =>  _.first(_.shuffle(nums));


