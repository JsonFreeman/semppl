var _ = require("underscore");
var semFuncs = require("./semantics");

function parse(grammar, sentence, featureFn, scoreFn, beamSize) {
	featureFn = featureFn || () => ({}); // Empty feature function
	scoreFn = scoreFn || constScoreFn;
	beamSize = beamSize || 200;

	// Split on whitespace
	var words = sentence.split(/\s/);

	// CKY algorithm
	var chart = new Array(words.length);

	// Base case: bottom level
	for (var i = 0; i < words.length; i++) {
		chart[i] = [];
		chart[i][i] = _.groupBy(_.map(_.filter(grammar,
			rule => rule.RHS === words[i]), // filter
			rule => new Derivation(rule, /*leftChild*/ undefined, /*rightChild*/ undefined, rule.sem)), // map
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

			// Sort scores in descending order, and chop off to fit in the beam
			newCellDerivations.sort((d1, d2) => d2.getScore(scoreFn, featureFn)
											  - d1.getScore(scoreFn, featureFn));
			if (newCellDerivations.length > beamSize) {
				newCellDerivations.length = beamSize;
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
							newDerivations.push(new Derivation(rule, leftDeriv, rightDeriv, rule.sem));
						}
					}
				}
			}
		}

		return newDerivations;
	}
}

function constScoreFn(features) {
	return 1;
}

function randomScoreFn(features) {
	return _.random(100);
}

function ruleFeatureFn(derivation) {
	var features = {};
	if (!derivation.isLeaf()) {
		addFeatureValueFromOtherFeatures(features, derivation.leftChild.getFeatures(ruleFeatureFn));
		addFeatureValueFromOtherFeatures(features, derivation.rightChild.getFeatures(ruleFeatureFn));
	}
	
	// Add this derivation's own rule
	var ruleKey = derivation.rule.LHS + " -> " + derivation.rule.RHS;
	features[ruleKey] = 1 + (features[ruleKey] || 0);
	return features;
}

/*
	Updates features1 by adding values from features2. Existing values
	are combined by addition.
 */
function addFeatureValueFromOtherFeatures(features1, features2) {
	for (var f in features2) {
		features1[f] = features2[f] + (features1[f] || 0);
	}
}

function getRootCellDerivations(chart, startSymbol) {
	return getRootCell(chart)[startSymbol];
}

function getRootCell(chart) {
	return chart[0][chart[0].length - 1];
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

function printScoresInCell(cell, scoreFn, featureFn) {
	var derivations = _.flatten(_.values(cell));
	for (var deriv of derivations) {
		console.log(deriv.getScore(scoreFn, featureFn));
	}

	console.log(derivations.length)
}

function printDerivations(derivations) {
	console.log("[");
	for (var i = 0; i < derivations.length; i++) {
		console.log("  --- Derivation " + (i + 1));
		printDerivationRecursive(derivations[i], /*indentString*/ "    ");
	}
	console.log("]")
}

function printDerivationRecursive(derivation, indentString) {
	console.log(indentString + derivation.rule.LHS + " -> " + derivation.rule.RHS);
	if (!derivation.isLeaf()) {
		console.log(indentString + "left:");
		printDerivationRecursive(derivation.leftChild, indentString + "    ");
		console.log(indentString + "right:");
		printDerivationRecursive(derivation.rightChild, indentString + "    ");
	}
}

function printFeatures(derivations, featureFn) {
	for (var d of derivations) {
		console.log(d.getFeatures(featureFn));
	}
}

function annotateIndices(chart) {
	for (var i in chart) {
		for (var j in chart) {
			_.each(_.values(chart[i][j]), deriv => { 
				deriv.i = i;
				deriv.j = j;
			});
		}
	}

	return chart; // Just for convenience
}

function Derivation(rule, leftChild, rightChild, semantics) {
	this.rule = rule;
	this.leftChild = leftChild;
	this.rightChild = rightChild;

	// Construct semantics bottom up with recurrence. Don't pass in the world yet.
	this.semantics = this.isLeaf() ? semantics : semantics(leftChild.semantics, rightChild.semantics);
}

Derivation.prototype.isLeaf = function() {
	return !(this.leftChild && this.rightChild);
}

Derivation.prototype.getFeatures = function(featureFn) {
	if (!this._features) {
		this._features = featureFn(this);
	}
	return this._features;
}

Derivation.prototype.getScore = function(scoreFn, featureFn) {
	return scoreFn(this.getFeatures(featureFn));
}

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

var grammar = [
	{
		LHS: "$S",
		RHS: "$NP $VP",
		sem: semFuncs.backApply
	},
	{
		LHS: "$NP",
		RHS: "John",
		sem: semFuncs.entity("john")
	},
	{
		LHS: "$VP",
		RHS: "jumped",
		sem: semFuncs.predicate("jumped")
	}
];

var grammar2 = [
	{
		LHS: "$DET",
		RHS: "the",
		sem: semFuncs.iota
	},
	{
		LHS: "$N",
		RHS: "dog",
		sem: semFuncs.predicate('dog')
	},
	{
		LHS: "$N",
		RHS: "cat",
		sem: semFuncs.predicate('cat')
	},
	{
		LHS: "$V",
		RHS: "chased",
		sem: semFuncs.transitive("chased")
	},
	{
		LHS: "$VP",
		RHS: "$V $NP",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$NP",
		RHS: "$DET $N",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$S",
		RHS: "$NP $VP",
		sem: semFuncs.backApply
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

var doublingGrammar = [
	{
		LHS: "$S",
		RHS: "$S $S"
	},
	{
		LHS: "$S",
		RHS: "word"
	}
];

// console.log(parse(grammar, "John jumped"))
// console.log(getRootCellDerivations(parse(grammar2, "the dog chased the cat"), "$S"))
// printCellSizes(parse(grammar2, "the dog chased the cat"), "$S")
// printDerivations(getRootCellDerivations(parse(grammar3, "the dog saw the cat with the telescope"), "$S"))
// printCellSizes(parse(grammar3, "the dog saw the cat with the telescope"))
// console.log(getRootCellDerivations(annotateIndices(parse(doublingGrammar, "word word word word")), "$S"));
// printScoresInCell(getRootCell(parse(doublingGrammar, "word word word word word word word word word word word", undefined, randomScoreFn)), randomScoreFn, ruleFeatureFn);
// printCellSizes(parse(doublingGrammar, "word word word word word word word word word word word", undefined, randomScoreFn));
// printDerivations(getRootCellDerivations(parse(grammar3, "the dog saw the cat with the telescope", ruleFeatureFn), "$S"))
// printFeatures(getRootCellDerivations(parse(grammar3, "the dog saw the cat with the telescope", ruleFeatureFn), "$S"), ruleFeatureFn)

// Semantics tests
function grammar1Test() {
	var world1 = { "jumped": ["john", "mary"]};
	var world2 = { "jumped": ["mary"]};
	var world3 = {};

	var s = getRootCellDerivations(parse(grammar, "John jumped"), "$S")[0].semantics;
	console.log(s(world1));
	console.log(s(world2));
	console.log(s(world3));
}

grammar1Test();