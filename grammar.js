var _ = require("underscore");
var semFuncs = require("./semantics");

function indexify(grammar) {
	_.each(grammar, (rule, i) => {
		rule.id = i;
	})
	return grammar;
}

function makeNeuralScalarAdjectiveRule(name) {
    return {
		LHS: "$ADJ",
		RHS: name,
		sem: semFuncs.neuralScalarPredicate(name)
	};
}

function makeFixedScalarAdjectiveRule(name, dimension) {
	return {
		LHS: "$ADJ",
		RHS: name,
		sem: semFuncs.fixedDimensionScalarPredicate(name, dimension)
	};
}

function makeNeuralScalarAntonymRule(name, scaleName) {
    return {
        LHS: "$ADJ",
        RHS: name,
        sem: semFuncs.neuralScalarAntonym(scaleName)
    };
}

function makeFixedDimensionScalarAntonymRule(name, scaleName, dimension) {
    return {
        LHS: "$ADJ",
        RHS: name,
        sem: semFuncs.fixedScalarAntonym(scaleName, dimension)
    };
}

exports.ambiguousGrammar = indexify([
	{
		LHS: "$S",
		RHS: "null",
		sem: _.constant(_.constant(1)) // Always return true
	},
	{
		LHS: "$S",
		RHS: "$NP $VP",
		sem: semFuncs.backApply
	},
	{
		LHS: "$VP",
		RHS: "$COP $ADJ",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$ADJ",
		RHS: "$DET $ADJ",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$ADJ",
		RHS: "$ADJ $ADJ",
		sem: semFuncs.intersectPredicates
	},
	{
		LHS: "$ADJ",
		RHS: "$ADJ $ADJ",
		sem: semFuncs.first
	},
	{
		LHS: "$ADJ",
		RHS: "$ADJ $ADJ",
		sem: semFuncs.second
	},
	{
		LHS: "$ADJ",
		RHS: "$ADJ $ADJ",
		sem: semFuncs.const
	},
	{
		LHS: "$NP",
		RHS: "John",
		sem: semFuncs.entity("john")
	},
	{
		LHS: "$COP",
		RHS: "is",
		sem: semFuncs.id
	},
	{
		LHS: "$DET",
		RHS: "a",
		sem: semFuncs.id
	},
    makeNeuralScalarAdjectiveRule("tall"),
    makeNeuralScalarAdjectiveRule("heavy"),
    makeNeuralScalarAntonymRule("short", "tall"),
    makeNeuralScalarAntonymRule("light", "heavy"),
	makeNeuralScalarAdjectiveRule("man"),
	makeNeuralScalarAdjectiveRule("building"),
]);

exports.fixedGrammar = indexify([
	{
		LHS: "$S",
		RHS: "null",
		sem: _.constant(_.constant(1)) // Always return true
	},
	{
		LHS: "$S",
		RHS: "$NP $VP",
		sem: semFuncs.backApply
	},
	{
		LHS: "$VP",
		RHS: "$COP $ADJ",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$ADJ",
		RHS: "$DET $ADJ",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$NP",
		RHS: "John",
		sem: semFuncs.entity("john")
	},
	{
		LHS: "$COP",
		RHS: "is",
		sem: semFuncs.id
	},
	{
		LHS: "$DET",
		RHS: "a",
		sem: semFuncs.id
	},
    makeFixedScalarAdjectiveRule("tall", "height"),
    makeFixedScalarAdjectiveRule("heavy", "weight"),
    makeFixedDimensionScalarAntonymRule("short", "tall", "height"),
    makeFixedDimensionScalarAntonymRule("light", "heavy", "weight"),
	makeFixedScalarAdjectiveRule("man", "man"),
	makeFixedScalarAdjectiveRule("building", "building"),
]);
