const elements = JSON.parse($.ajax({//ewwwwwwwwww
  url: 'modifiedLookup.json',
  async: false,
  dataType: 'json',
  success: function (response) {
    return response;//what lol
  }
}).responseText);

/*
todo:
Display all relevant information for each component (mass, molar mass, actual moles) | maybe worth doing later
Ditch processing, or utilize it well
 HTML based. textboxes. confirm buttons OR update on char typed. run what is currently the setup function
Identify limiting reactants and the leftover masses of other reactants | well it shows mass remaining
 and of course show the amount of product produced
Display atom totals for each side, ordered/symmetric
Parenthesis support | DONE
Make it an API or library to be used by the discord bot
Embrace the asynchronous?
 someone convince me that elements shouldn't be required to go immediately
Add flip button
Significant Figures should be calculated based on input. For now, i'll set it here.
 Also I need to be aware of the decimal point
*/

function setup() {
  //const input = "4NaC2H3O2 + PbO2 > PbC8H12O8 + 2Na2O";//great example equation 
  const input = "Na2Cl2+Fe(OH)2>2NaOH+FeCl2";
  //vs Pb(C2H3O2)2
  const reactantMasses = [null, 500];//eh, just have the user find sig figs themselves\
  //use blank to mean excess
  const reactantMoles = [];//note: not working right now
  const actualOutput = null;//set to what it should yeild
  let reactants = {//a good guide
    components: {},//should the components molar mass include being multiplied by the amount of moles there are in the specific equation?
    //note: give components "leftover" property
    //maybe excess: bool? 
    //Amount Required vs Excess Amount
    totalElements: {},
  };
  let products = {//a good guide
    components: {},//should the components molar mass include being multiplied by the amount of moles there are in the specific equation?
    totalElements: {},
  };
  var allAtoms = {};
  //let excessComponent; //as opposed to what, an array of limiting components? bool values in their respsective thingies?
  let limitingReactant;//ok i get it
  const sigFigs = 6;
  createCanvas(1000, 500);
  strokeWeight(10);
  stroke('#771177');
  fill(0, 0, 0);
  rect(0, 0, width, height);
  fill('#FFFFFF');
  stroke('#FFFFFF');
  noStroke();
  textSize(50);
  text(input, 10, 60);
  textSize(20);
  const yeildsIndex = input.indexOf(">");
  if (yeildsIndex!==-1&&yeildsIndex===input.lastIndexOf(">")) {
    //from here
    const left = input.substring(0, yeildsIndex);
    const reactants = initializeSide(left, reactantMasses);//note: add reactantMoles later
    
    const right = input.substring(yeildsIndex+1, input.length);
    const products = initializeSide(right);//shouldn't be constants -- actually if it changes to use real HTML buttons then yes just run the whole thing

    Object.keys(reactants.totalElements).forEach((element, index) => {
      //text(element, 200, 100+20*index)
      //text(reactants.totalElements[element], 150, 100+20*index)
      if (reactants.totalElements[element]!==products.totalElements[element]) {
        text("Not balanced, nerd!", 15, 80);
        console.error("oopsie poopsie");
        //return;
      }
    });
    text(JSON.stringify(reactants.totalElements), 10, 120);

    Object.keys(products.totalElements).forEach((element, index) => {
      //text(products.totalElements[element], 250, 100+50*index)
      
      if (products.totalElements[element]!==reactants.totalElements[element]) {
        text("Not balanced, nerd!", 15, 80);
        console.error("oopsie poopsie");
        //return;
      }
    });
    text(JSON.stringify(products.totalElements), 250, 150);
    //to here kinda suck
    //it could probably be all one function that I call twice. update it is half done
    
    //text(reactants.components[Object.keys(reactants.components)[0]].moles, 20, 300);
    Object.keys(reactants.components).forEach((component, index) => {
      if (reactantMoles[index]) {//if both set, moles will overwrite the mass/molarMass calculation
        reactants.components[component].moles = reactantMoles[index];
        reactants.components[component].mass = reactantMoles[index]*reactants.components[component].molarMass;
      } else if (!reactants.components[component].moles) return;//could be moved to initialize function. old note. idk.
      //if moles isn't set the we know that neither mass or moles aren't set.
      /*
      text(component, 20, 180+80*index); 
      text("Mass: " + (reactants.components[component].mass).toString().substring(0, sigFigs) + "g", 20, 200+80*index); 
      text("Moles: " + (reactants.components[component].moles).toString().substring(0, sigFigs), 20, 220+80*index);
      */
      //all of this text should be moved ...? well I'm already working with the reactant components... why make another entire forEach?
      //a: because I don't know 
      for (productComponent in products.components) {//I'll need to ensure that
        let newMoles = 
          reactants.components[component].moles * 
          products.components[productComponent].amount /
          reactants.components[component].amount;
        //if (!products.components[productComponent].moles) products.components[productComponent].moles = 0;//could be set with the intialization
        if (!products.components[productComponent].moles || newMoles < products.components[productComponent].moles) {//moles could be set elsewhere
          limitingReactant = component;
          products.components[productComponent].moles = newMoles;
          products.components[productComponent].mass = products.components[productComponent].moles*products.components[productComponent].molarMass;
        }
      }

    });
    //at this stage I should calculate the mass/moles for the excess reactants
    //also calculate the leftover 
    //note: use the handy dandy limitingReactant variable, instead of reversing the product math or something.
    //alright. let's go through all the reactants and calculate how much is needed based on the now known limiting reactant.
    limitingReactant = reactants.components[limitingReactant];
    Object.keys(reactants.components).forEach((component, index) => {
      const massUsed = limitingReactant.moles / limitingReactant.amount * reactants.components[component].amount * reactants.components[component].molarMass;
      text(component, 10, 180+80*index); 
      text("Mass Used: " + massUsed.toString().substring(0, sigFigs) + "g" , 20, 200+80*index);
      if (reactants.components[component].mass) {
        text("Mass Left: " + (reactants.components[component].mass-massUsed).toString().substring(0, sigFigs) +"g", 20, 220+80*index);
        text(
          "Moles Left: " + ((reactants.components[component].mass-massUsed)/(reactants.components[component].molarMass)).toString().substring(0, sigFigs),
          20, 240+80*index);
      } else {//if for sure (can't spell) excess then..

      }
    });

    Object.keys(products.components).forEach((productComponent, index) => {
      text(productComponent, 250, 180+80*index);  
      text("Mass: " + (products.components[productComponent].mass).toString().substring(0, sigFigs) + "g", 260, 200+80*index);
      text("Moles: " + (products.components[productComponent].moles).toString().substring(0, sigFigs), 260, 220+80*index);
    });

    if (actualOutput) {
      let efficiency = products.components[Object.keys(products.components)[0]].mass/actualOutput;
      text((efficiency*100).toString().substring(0, sigFigs)+"% Efficiency", 200, 400);
    }
    

    text("After a long journey... your equation is balanced", 15, 80);
  } else {
    text("Heyo, your equation doesn't yeild anything! Use \">\"", 15, 80);//future self pls use real html
  }
}

function getComponents(componentString) {
  let components = {}
  let lastCharIndex = 0;
  for (i = 0; i <= componentString.length; i++) {
    let currentChar = componentString[i];
    if (currentChar === " ") {
      //lastCharIndex = i + 1;
      continue;
    } else if (currentChar === "+" || i === componentString.length) {
      components[componentString.substring(lastCharIndex, i)] = {
        molarMass: 0,
        elements: {},
        amount: null
      };
      lastCharIndex = i+1;
    }// } else { todo: add yucky char detection
    //   console.log("Pretty sure there is a yucky character here")
    // }
  }
  return components;
}

function getElements(componentString) {
  let foundElements = {};
  let totalMultiplier = 1;
  let settingIndex;
  let multipliers = [1];//should later become an array, values correspond to index of parenthesis depth 4(C(NO3)2)5 --> [5, 2, 3]
  let [moleAmount, lowValue] = getFullNumber(componentString, 0);
  //for (i; i < componentString.length; i++) {//actually starting from teh end and going backwards would be better
  for(let i = componentString.length-1; i > lowValue; i--) {
    if (componentString[i] === " ") {//should probably be replaced with a switch case
      continue;
    } else if (!isNaN(componentString[i])) {//if it's a number
      let j = i-1;
      while (!isNaN(componentString[j])) {//for sake of readability and understanding and laziness, just go until yes
        j--;
      }
      //settingIndex = componentString[j]===")" ? multipliers.length : 0; // if you stopped on an opening parenthesis, expand the array
      //bruh i just wanna use the ternary operator
      //ok so i can't subtract from j right now... but what if i do?
      //no no, let's just see if componentString[(currentj)]===")" later. it might be the best way
      if (componentString[j]===")") {
        settingIndex = multipliers.length;
        //j--;
      } else {
        settingIndex = 0;
      }
      //otherwise you're setting a specific element's multiplier at index 0
      j++;
      multipliers[settingIndex] = parseInt(componentString.substring(j, i+1));
      i = j;
      if (componentString[j-1]===")") i--;
    } else if (componentString[i] === "(") {
      //multipliers[multipliers.length-1] = null; sadge
      multipliers.length = multipliers.length-1; 
      multipliers[0] = 1;
    } else { //if it's not a number
    //if you put it in stupidly then it's your fault
      //numberStartIndex = null;
      //note: just use ternary thing actually no because of the i--
      let symbol;
      if (componentString.charCodeAt(i)>96&&componentString.charCodeAt(i)<123) {//if lowercase
        symbol = componentString.substring(i-1,i+1);
        i--;
      } else if (componentString.charCodeAt(i)>64&&componentString.charCodeAt(i)<91) {//if uppcase
        symbol = componentString[i];
      } else {
        console.error("Uh oh stinky: " + componentString[i] + " at index " + i);
        //text(componentString[i] + " is not a capital letter", 15, 300+i*20);
      }
      //text(elements[symbol].name, 15, 300+i*20);
      if (!foundElements[symbol]) {
        foundElements[symbol] = 0;
      }
      totalMultiplier = 1;
      for (multiplier of multipliers) {
        totalMultiplier *= multiplier;
      }
      foundElements[symbol] += totalMultiplier;//*moleAmount; moleAmount? more like amount of moles bandaid fix by passing it in return
      multipliers[0] = 1;
    }
    
  }
  //text(moleAmount, 100,400);
  return [foundElements, moleAmount];
}

function getFullNumber(componentString, numberStartIndex) {//i think the while loop version is better
  for (var j = numberStartIndex; j < componentString.length; j++) {
    if (isNaN(componentString[j])) {
      if (componentString[j] === " ") {
        continue;
      } else {
        break;
      }
    }
  }
  const endResult = parseInt(componentString.substring(numberStartIndex, j));
  return [Boolean(endResult) ? endResult : 1, j-1];
}

function initializeSide(sideString, massArray = [], moleArray) {//as opposed to sideObject or just side
  const side = {
    components: {},
    totalElements: {}
  };
  side.components = getComponents(sideString);
  Object.keys(side.components).forEach((component, index) => {//i would like to simplify to a for component in object.keys blah blah
    //i have done the thing I said I would down there. aybe simplify to for component in side
    const [componentElements, amount] = getElements(component);
    for (element in componentElements) {//perhaps later getElements could be called in the getComponents function.
      if (!side.totalElements[element]) {
        side.totalElements[element] = 0;
      }
      side.totalElements[element] += componentElements[element]*amount;
      side.components[component].elements[element] = componentElements[element];
      if (!elements[element]) console.error("Element: " + element + " has not been discovered. . . yet.");
      side.components[component].molarMass += componentElements[element]*elements[element].atomic_mass;
    }
    side.components[component].amount = amount;
    if (massArray[index]) {
      side.components[component].mass = massArray[index];
      side.components[component].moles = massArray[index] / side.components[component].molarMass;
    }
  });
  return side;
}
