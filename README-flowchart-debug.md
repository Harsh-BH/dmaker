# Flowchart Troubleshooting Guide

This guide helps diagnose and fix issues with flowchart generation in the dmaker project.

## Common Issues and Solutions

### 1. Boxes Not Rendering Correctly

Possible causes:
- Node types not defined correctly
- Missing style information
- Incorrect dimensions

Solution:
- Ensure each node has a valid type (start, end, process, decision)
- Check if style objects are properly defined
- Use the `flowchartFixer.js` utility to automatically fix dimension issues

### 2. Connections Between Boxes Not Working

Possible causes:
- Invalid source or target IDs
- Edge data structure issues
- Positioning problems

Solution:
- Validate that all edge source/target IDs match existing node IDs
- Check the edge data structure format
- Verify that connection anchor points are calculated correctly

### 3. Layout Problems

Possible causes:
- Overlapping nodes
- Poor positioning logic
- Automatic layout not working

Solution:
- Use the position adjustment function in `flowchartFixer.js`
- Increase spacing between nodes
- Implement or fix automatic layout algorithms

## Debugging Process

1. Enable the debug logger:
```javascript
const logger = require('./utils/debugLogger');
logger.enable();
```

2. Run the diagnostic test:
```bash
node tests/flowchart-test.js
```

3. Check the logs at `logs/flowchart-debug.log`

4. Use the flowchart fixer to correct common issues:
```javascript
const fixer = require('./utils/flowchartFixer');
const fixedData = fixer.fixCommonIssues(flowchartData);
```

## Box Types and Rendering

Different box types should be rendered as follows:

1. **Start/End Nodes**: Rounded rectangles or ovals
2. **Process Nodes**: Rectangles
3. **Decision Nodes**: Diamonds
4. **Input/Output Nodes**: Parallelograms

Ensure each node type has appropriate style definitions and rendering logic.
