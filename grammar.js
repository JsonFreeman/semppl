var _ = require("underscore");
var semFuncs = require("./semantics");

function indexify(grammar) {
	_.each(grammar, (rule, i) => {
		rule.id = i;
	})
	return grammar;
}

function makeNeuralScalarItemRule(name, pos) {
    return {
		LHS: pos,
		RHS: name,
		sem: semFuncs.neuralScalarPredicate(name)
	};
}

function makeFixedScalarItemRule(name, dimension, pos) {
	return {
		LHS: pos,
		RHS: name,
		sem: semFuncs.fixedDimensionScalarPredicate(name, dimension)
	};
}

function makeNeuralScalarAntonymRule(name, scaleName, pos) {
    return {
        LHS: pos,
        RHS: name,
        sem: semFuncs.neuralScalarAntonym(scaleName)
    };
}

function makeFixedDimensionScalarAntonymRule(name, scaleName, dimension, pos) {
    return {
        LHS: pos,
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
    makeNeuralScalarItemRule("tall", "$ADJ"),
    makeNeuralScalarItemRule("heavy", "$ADJ"),
    makeNeuralScalarAntonymRule("short", "tall", "$ADJ"),
    makeNeuralScalarAntonymRule("light", "heavy", "$ADJ"),
	makeNeuralScalarItemRule("man", "$ADJ"),
	makeNeuralScalarItemRule("building", "$ADJ"),
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
    makeFixedScalarItemRule("tall", "height", "$ADJ"),
    makeFixedScalarItemRule("heavy", "weight", "$ADJ"),
    makeFixedDimensionScalarAntonymRule("short", "tall", "height", "$ADJ"),
    makeFixedDimensionScalarAntonymRule("light", "heavy", "weight", "$ADJ"),
	makeFixedScalarItemRule("man", "man", "$ADJ"),
	makeFixedScalarItemRule("building", "building", "$ADJ"),
]);
