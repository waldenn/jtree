const TreeProgram = require("../TreeProgram.js")
const fs = require("fs")

class TreeGrammarProgram extends TreeProgram {
  getGrammarString() {
    return fs.readFileSync(this.getGrammarFilePath(), "utf8")
  }

  getGrammarFilePath() {
    return __dirname + "/TreeGrammar.grammar"
  }
}

module.exports = TreeGrammarProgram
