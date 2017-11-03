const AnyProgram = require("./AnyProgram.js")
const TreeNode = require("./TreeNode.js")
const TreeNonTerminalNode = require("./TreeNonTerminalNode.js")
const TreeTerminalNode = require("./TreeTerminalNode.js")

const GrammarProgram = require("./grammar/GrammarProgram.js")

class TreeProgram extends AnyProgram {
  getKeywordMap() {
    return this.getDefinition().getRunTimeKeywordMap()
  }

  getCatchAllNodeClass(line) {
    // todo: blank line
    // todo: restore didyoumean
    return this.getDefinition().getRunTimeCatchAllNodeClass()
  }

  getErrorCount() {
    const grammarProgram = this.getDefinition()
    return {
      errorCount: this.getProgramErrors().length,
      name: grammarProgram.getExtensionName()
    }
  }

  // todo: implement
  _getNodeJoinCharacter() {
    return "\n"
  }

  compile(targetExtension) {
    return this.getChildren()
      .map(child => child.compile(targetExtension))
      .join(this._getNodeJoinCharacter())
  }

  async run() {}

  getDefinition() {
    return this.getGrammarProgram()
  }

  getGrammarUsage(filepath = "") {
    const usage = new TreeProgram()
    const grammarProgram = this.getGrammarProgram()
    const keywordDefinitions = grammarProgram.getChildren()
    keywordDefinitions.forEach(child => {
      usage.append([child.getWord(0), "line-id", "keyword", child.getBeamParameters().join(" ")].join(" "))
    })
    const programNodes = this.getTopDownArray()
    programNodes.forEach((programNode, lineNumber) => {
      const def = programNode.getDefinition()
      const keyword = def.getKeyword()
      const stats = usage.getNode(keyword)
      stats.append([filepath + "-" + lineNumber, programNode.getWords().join(" ")].join(" "))
    })
    return usage
  }

  getGrammarProgram() {
    return TreeProgram._getCachedGrammarProgram(this)
  }

  getProgramWordTypeString() {
    return this.getTopDownArray()
      .map(child => child.getIndentation() + child.getWordTypeLine())
      .join("\n")
  }

  getWordTypeAtPosition(lineIndex, wordIndex) {
    this._initWordTypeCache()
    const typeNode = this._cache_typeTree.getTopDownArray()[lineIndex - 1]
    return typeNode ? typeNode.getWord(wordIndex - 1) : ""
  }

  _initWordTypeCache() {
    const treeMTime = this.getTreeMTime()
    if (this._cache_programWordTypeStringMTime === treeMTime) return undefined

    this._cache_typeTree = new TreeProgram(this.getProgramWordTypeString())
    this._cache_programWordTypeStringMTime = treeMTime
  }

  getCompiledProgramName(programPath) {
    const grammarProgram = this.getDefinition()
    return programPath.replace(`.${grammarProgram.getExtensionName()}`, `.${grammarProgram.getTargetExtension()}`)
  }

  getGrammarFilePath() {
    return ""
  }

  getNodeClasses() {
    return {}
  }

  static compileCompiler(program) {
    const grammarString = program.getGrammarString()
    const filepath = program.getGrammarFilePath()
    // todo: remove non-raii methods
    return new GrammarProgram(new AnyProgram(grammarString).getExpanded())
      .setFilePath(filepath)
      .setNodeClasses(program.getNodeClasses())
  }

  static _getCachedGrammarProgram(program) {
    const key = program.getGrammarString()
    if (!this._cache_grammarPrograms) this._cache_grammarPrograms = {}
    if (!this._cache_grammarPrograms[key]) this._cache_grammarPrograms[key] = this.compileCompiler(program)
    return this._cache_grammarPrograms[key]
  }

  static getGrammarErrors(programPath, grammarFilePath) {
    const fs = require("fs")
    class TemporaryLanguageFromGrammarFileProgram extends TreeProgram {
      getGrammarString() {
        return removeFirstLine(fs.readFileSync(grammarFilePath, "utf8"))
      }
    }
    let source = fs.readFileSync(programPath, "utf8")
    const program = new TemporaryLanguageFromGrammarFileProgram(source)
    return program.getProgramErrors()
  }
}

TreeProgram.TreeNode = TreeNode
TreeProgram.NonTerminalNode = TreeNonTerminalNode
TreeProgram.TerminalNode = TreeTerminalNode

module.exports = TreeProgram
