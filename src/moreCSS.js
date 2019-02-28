function throwError (lineNumber, line, errType, errString) {
  throw new Error(`MoreCSS - ${errType} - ${errString}
at line ${lineNumber + 1},
'${line}'`)
}

const numberModifiers = {
  'thousand': 1000,
  'hundred': 100
}
const numbers = {
  'one': 1,
  'two': 2,
  'three': 3,
  'four': 4,
  'five': 5,
  'six': 6,
  'seven': 7,
  'eight': 8,
  'nine': 9,
  'ten': 10,
  'eleven': 11,
  'twelve': 12,
  'thirteen': 13,
  'fourteen': 14,
  'fifteen': 15,
  'sixteen': 16,
  'seventeen': 17,
  'eighteen': 18,
  'nineteen': 19,
  'twenty': 20,
  'thirty': 30,
  'fourty': 40,
  'fifty': 50,
  'sixty': 60,
  'seventy': 70,
  'eighty': 80,
  'ninety': 90
}

function interpretSemanticNumber (numString) {
  let nums = numString.split('-')
  let i = 0
  let total = 0

  while (i < nums.length) {
    if (!Object.keys(numbers).includes(nums[i])) {
      // Probably the word 'and'
      i++
      continue
    }
    let val = numbers[nums[i]]

    // Is the next word a modifier?
    if (Object.keys(numberModifiers).includes(nums[i + 1])) {
      // Modify the number and skip the next word
      val *= numberModifiers[nums[i + 1]]
      i++
    }

    total += val
    i++
  }
  return total
}

function isSemanticNumber (numString) {
  let nums = numString.split('-')
  for (let n of nums) {
    if (Object.keys(numbers).includes(n)) return true
  }
  return false
}

class MoreCSSTranspiler {
  constructor (moreString) {
    this.styles = {}
    this.moreLines = moreString.split(/\r?\n/g)
  }

  transpile () {
    for (let i = 0; i < this.moreLines.length; i++) {
      this.transpileLine(i)
    }
    let cssOut = ''
    for (let s in this.styles) {
      cssOut = `${cssOut}\n${s} {\n`
      for (let sS of this.styles[s]) {
        cssOut = `${cssOut}${sS}\n`
      }
      cssOut = `${cssOut}}`
    }
    return cssOut
  }

  transpileLine (lineNumber) {
    let line = this.moreLines[lineNumber]

    if (
      line.includes('center') ||
      line.includes('color')
    ) {
      throwError(lineNumber, line, 'Style linting', 'American spelling')
    }

    let isImportant = !(line.includes('!unimportant'))
    line = line.replace('!unimportant', '').replace(';', '')

    // Find the split between the property and the selector
    let selSplit = line.split(':')[0].split(' ')
    let value = this.transpileValue(line.split(':')[1])
    let property = (selSplit[selSplit.length - 1]).replace(/colour/g, 'color')
    let selector = selSplit.filter((x, i) => i !== selSplit.length - 1).join(' ')

    if (!Object.keys(this.styles).includes(selector)) {
      this.styles[selector] = []
    }

    this.styles[selector]
      .push(`${property}:${value} ${isImportant ? '!important' : ''};`)
  }

  transpileValue (value) {
    value = value.trim()
    let values = value.split(' ')
    let newValues = []
    for (let v of values) {
      let newV = v.replace(/pixels/g, 'px').replace(/percent/g, '%').replace(/centre/g, 'center')
      if (isSemanticNumber(v)) {
        newV = interpretSemanticNumber(v)
      }
      newValues.push(newV)
    }
    return newValues.join(' ')
  }
}

window.MoreCSSTranspiler = MoreCSSTranspiler
