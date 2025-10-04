// Reference to the display element where input and results will appear
const display = document.getElementById('display');

// Reference to all calculator buttons
const buttons = document.querySelectorAll('.btn');

// Holds the current expression typed by the user
let expression = '';

// Function to safely evaluate basic arithmetic expressions without using eval()
function safeEval(expr) {
  try {
    // Only allow numbers, decimal points, and basic operators
    if (!/^[0-9+\-*/%.]+$/.test(expr)) throw new Error('Invalid characters');
    // Use Function constructor to evaluate expression safely
    // eslint-disable-next-line no-new-func
    return Function('"use strict";return (' + expr + ')')();
  } catch {
    throw new Error('Invalid calculation');
  }
}

// Update the display with current expression or error message
function updateDisplay(message = null, isError = false) {
  if (isError) {
    display.innerText = message || 'Error';
    display.classList.add('error'); // Highlight display in red for errors
  } else {
    display.innerText = message !== null ? message : (expression || '0');
    display.classList.remove('error');
  }
}

// Add a number or decimal point to the current expression
function appendNumber(num) {
  const parts = expression.split(/[\+\-\*\/%]/); // Split by operators
  const lastPart = parts[parts.length - 1];
  // Prevent multiple decimals in the same number
  if (num === '.' && lastPart.includes('.')) return;
  expression += num;
  updateDisplay();
}

// Add an operator to the expression
function appendOperator(op) {
  const lastChar = expression.slice(-1);

  // Allow minus at the start for negative numbers
  if (!expression && op === '-') { 
    expression += op; 
    updateDisplay(); 
    return; 
  }

  // Prevent starting with other operators
  if (!expression && op !== '-') return;

  // Replace last operator if two operators are entered consecutively
  if ("+-*/%".includes(lastChar)) {
    if (op === '-' && lastChar !== '-') { 
      expression += op; 
    } else { 
      expression = expression.slice(0, -1) + op; 
    }
  } else { 
    expression += op; 
  }
  updateDisplay();
}

// Clear the entire display
function clearDisplay() { 
  expression = ''; 
  updateDisplay(); 
}

// Delete the last character from the expression
function deleteLast() { 
  expression = expression.slice(0, -1); 
  updateDisplay(); 
}

// Convert the last number in the expression to a percentage
function calculatePercent() {
  if (!expression) return;
  const tokens = expression.split(/([\+\-\*\/%])/);
  const last = tokens[tokens.length - 1];
  if (!isNaN(last) && last !== '') {
    tokens[tokens.length - 1] = (parseFloat(last)/100).toString();
    expression = tokens.join('');
    updateDisplay();
  }
}

// Calculate square root of the current expression
function calculateSqrt() {
  try {
    const val = safeEval(expression);
    if (val < 0) throw new Error('Cannot take square root of negative number');
    expression = Math.sqrt(val).toString();
    updateDisplay();
  } catch(e) { 
    updateDisplay(e.message, true); 
    expression=''; 
  }
}

// Evaluate the full expression and show result
function calculateResult() {
  if (!expression) return;
  try {
    // Remove trailing operators if any
    while ("+-*/%".includes(expression.slice(-1))) expression = expression.slice(0,-1);
    const result = safeEval(expression);
    if (!isFinite(result)) throw new Error('Math error: Division by zero');
    expression = result.toString();
    updateDisplay();
  } catch(e) { 
    updateDisplay(e.message, true); 
    expression=''; 
  }
}

// Add click event listeners to all buttons
buttons.forEach(button => {
  button.addEventListener('click', () => {
    const num = button.dataset.num;
    const op = button.dataset.op;
    const id = button.id;

    if (num !== undefined) appendNumber(num);
    else if (op !== undefined) appendOperator(op);
    else if (id === 'clear') clearDisplay();
    else if (id === 'delete') deleteLast();
    else if (id === 'percent') calculatePercent();
    else if (id === 'sqrt') calculateSqrt();
    else if (id === 'equals') calculateResult();
  });
});

// Keyboard support for typing numbers and operators
document.addEventListener('keydown', (e) => {
  const key = e.key;

  if ((/\d/).test(key)) appendNumber(key); // Number keys
  else if (key === '.') appendNumber(key); // Decimal point
  else if (['+', '-', '*', '/', '%'].includes(key)) appendOperator(key); // Operators
  else if (key === 'Enter' || key === '=') { e.preventDefault(); calculateResult(); } // Enter or = to calculate
  else if (key === 'Backspace') deleteLast(); // Delete last character
  else if (key.toLowerCase() === 'c') clearDisplay(); // Clear with C key
});
