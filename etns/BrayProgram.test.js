#! /usr/local/bin/node --use_strict

const BrayProgram = require("./BrayProgram.js")
const WallProgram = require("./WallProgram.js")

const program = `basics
 in
  > html bam someClass
   > body
    > div
     type foo
     content Hello world
      This is some text
 out
  <html id="bam" classes="someClass"> <body>  <div type="foo">Hello world
  This is some text</div>
  </body>
  </html>
  `

const tests = new WallProgram(program)

!module.parent
  ? tests.execute(node => {
      const sourceETNCode = node.getNode("in").childrenToString()
      const expected = node.getNode("out").childrenToString()
      const actual = new BrayProgram(sourceETNCode).toHtml()
      const message = node.getLine()
      return {
        actual: actual,
        expected: expected,
        message: message
      }
    })
  : (module.exports = tests)