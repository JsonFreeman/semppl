var _ = require("underscore");

function parse(sentence) {
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
}

function Derivation(rule, leftChild, rightChild) {
	this.rule = rule;
	this.leftChild = leftChild;
	this.rightChild = rightChild;
}

function collectDerivations(leftCell, rightCell) {
	// Make a list of new derivations for all grammar rules that apply for the give children.
	var newDerivations = [];
	for (var rule of grammar) {
		var rhsNonTerminals = rule.RHS.split(/\s/);
		if (rhsNonTerminals.length === 2) {
			// If both nonterminals on the RHS match the child cells, make a derivation with them as the children
			if (_.has(leftCell, rhsNonTerminals[0]) && _.has(rightCell, rhsNonTerminals[1])) {
				newDerivations.push(new Derivation(rule, leftCell[rhsNonTerminals[0]], rightCell[rhsNonTerminals[1]]));
			}
		}
	}

	return newDerivations;
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

console.log(parse("John jumped")[0][1])