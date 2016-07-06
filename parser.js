var _ = require("underscore");

function parse(sentence) {
	// Split on whitespace
	var words = sentence.split(/\s/);

	// CKY algorithm
	var chart = new Array(words.length);

	// Base case: bottom level
	for (var i = 0; i < words.length; i++) {
		chart[i] = new Array(words.length - i);

		// TODO: Handle arbitrary number of applying rules (including 0)
		// 0 index means span is of length 1
		chart[i][i] = _.filter(grammar, rule => rule.RHS === words[i])
					   .map(rule => new Derivation(rule, /*children*/ undefined));
	}

	// Recursive case
	for (var width = 2; width <= words.length; width++) {
		var offsetLimit = words.length - width;
		for (var offset = 0; offset <= offsetLimit; offset++) {
			// Cell we are interested in
			assert(!chart[offset][offset + width - 1], "cell not null");
			for (var splitIndex = offset + 1; splitIndex < offset + width; splitIndex++) {

			}
		}
	}
	return chart;
}

function Derivation(rule, children) {
	this.rule = rule;
	this.children = children;
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

console.log(parse("John jumped"))