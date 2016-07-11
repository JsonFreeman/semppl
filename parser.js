var _ = require("underscore");

function parse(grammar, sentence) {
	// Split on whitespace
	var words = sentence.split(/\s/);

	// CKY algorithm
	var chart = new Array(words.length);

	// Base case: bottom level
	for (var i = 0; i < words.length; i++) {
		chart[i] = [];
		chart[i][i] = _.groupBy(_.map(_.filter(grammar,
			rule => rule.RHS === words[i]), // filter
			rule => new Derivation(rule, /*leftChild*/ undefined, /*rightChild*/ undefined)), // map
			derivation => derivation.rule.LHS); // groupBy
	}

	// Recursive case
	for (var width = 2; width <= words.length; width++) {
		var offsetLimit = words.length - width;
		for (var offset = 0; offset <= offsetLimit; offset++) {
			// Cell we are interested in
			assert(!chart[offset][offset + width - 1], "cell not null");
			var newCellDerivations = [];
			// splitIndex includes the leftmost singleton cell, but not the rightmost singleton cell
			for (var splitIndex = offset; splitIndex < offset + width - 1; splitIndex++) {
				assert(chart[offset][splitIndex], "left cell null");
				assert(chart[splitIndex + 1][offset + width - 1], "right cell null");

				newCellDerivations = newCellDerivations.concat(
					collectDerivations(
						chart[offset][splitIndex], chart[splitIndex + 1][offset + width - 1]));
			}

			chart[offset][offset + width - 1] = _.groupBy(newCellDerivations, derivation => derivation.rule.LHS);
		}
	}

	return chart;

	function collectDerivations(leftCell, rightCell) {
		// Make a list of new derivations for all grammar rules that apply for the give children.
		var newDerivations = [];
		for (var rule of grammar) {
			var rhsNonTerminals = rule.RHS.split(/\s/);
			if (rhsNonTerminals.length === 2) {
				// If both nonterminals on the RHS match the child cells, make a derivation with them as the children
				if (_.has(leftCell, rhsNonTerminals[0]) && _.has(rightCell, rhsNonTerminals[1])) {
					for (var leftDeriv of leftCell[rhsNonTerminals[0]]) {
						for (var rightDeriv of rightCell[rhsNonTerminals[1]]) {
							newDerivations.push(new Derivation(rule, leftCell[rhsNonTerminals[0]], rightCell[rhsNonTerminals[1]]));
						}
					}
				}
			}
		}

		return newDerivations;
	}
}

function getRootCellDerivations(chart, startSymbol) {
	return chart[0][chart[0].length - 1][startSymbol];
}

function printCellSizes(chart) {
	var starting = "";
	for (var i = 0; i < chart.length; i++) {
		var s = starting;
		for (var j = i; j < chart[i].length; j++) {
			// Aggregate counts over all groups
			s += _.reduce(_.values(chart[i][j]), (memo, list) => memo + list.length, /*memo*/ 0) + " ";
		}
		starting += "  ";
		console.log(s);
	}
}

function Derivation(rule, leftChild, rightChild) {
	this.rule = rule;
	this.leftChild = leftChild;
	this.rightChild = rightChild;
}

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

var grammar = [
	{
		LHS: "$S",
		RHS: "$NP $VP"
	},
	{
		LHS: "$NP",
		RHS: "John"
	},
	{
		LHS: "$VP",
		RHS: "jumped"
	}
];

var grammar2 = [
	{
		LHS: "$DET",
		RHS: "the"
	},
	{
		LHS: "$N",
		RHS: "dog"
	},
	{
		LHS: "$N",
		RHS: "cat"
	},
	{
		LHS: "$V",
		RHS: "chased"
	},
	{
		LHS: "$VP",
		RHS: "$V $NP"
	},
	{
		LHS: "$NP",
		RHS: "$DET $N"
	},
	{
		LHS: "$S",
		RHS: "$NP $VP"
	}
];

var grammar3 = grammar2.concat([
	{
		LHS: "$V",
		RHS: "saw"
	},
	{
		LHS: "$VP",
		RHS: "$VP $PP"
	},
	{
		LHS: "$NP",
		RHS: "$NP $PP"
	},
	{
		LHS: "$PP",
		RHS: "$P $NP"
	},
	{
		LHS: "$P",
		RHS: "with"
	},
	{
		LHS: "$N",
		RHS: "telescope"
	}
]);

console.log(parse(grammar, "John jumped"))
console.log(getRootCellDerivations(parse(grammar2, "the dog chased the cat"), "$S"))
printCellSizes(parse(grammar2, "the dog chased the cat"), "$S")
console.log(getRootCellDerivations(parse(grammar3, "the dog saw the cat with the telescope"), "$S"))
printCellSizes(parse(grammar3, "the dog saw the cat with the telescope"))