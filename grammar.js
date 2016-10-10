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
		RHS: "$COP $PRED",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$PRED",
		RHS: "$DET $PRED",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$PRED",
		RHS: "$PRED $PRED",
		sem: semFuncs.intersectPredicates
	},
	{
		LHS: "$PRED",
		RHS: "$PRED $PRED",
		sem: semFuncs.first
	},
	{
		LHS: "$PRED",
		RHS: "$PRED $PRED",
		sem: semFuncs.second
	},
	{
		LHS: "$PRED",
		RHS: "$PRED $PRED",
		sem: semFuncs.constTrue
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
    makeNeuralScalarItemRule("tall", "$PRED"),
    makeNeuralScalarItemRule("heavy", "$PRED"),
    makeNeuralScalarAntonymRule("short", "tall", "$PRED"),
    makeNeuralScalarAntonymRule("light", "heavy", "$PRED"),
	makeNeuralScalarItemRule("man", "$PRED"),
	makeNeuralScalarItemRule("building", "$PRED"),
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
		RHS: "$COP $NP",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$VP",
		RHS: "$COP $ADJ",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$NP",
		RHS: "$DET $N",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$N",
		RHS: "$ADJ $N",
		sem: semFuncs.intersectPredicates
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
	makeFixedScalarItemRule("man", "man", "$N"),
	makeFixedScalarItemRule("building", "building", "$N"),
]);
